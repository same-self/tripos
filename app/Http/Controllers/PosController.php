<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\Item;
use App\Models\Service;
use App\Services\SaleService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        $items = Item::with('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category->name,
                'unit' => $item->unit,
                'sell_price' => $item->sell_price,
                'stock' => $item->stock,
                'low_stock' => $item->isLowStock(),
            ]);

        $services = Service::with(['category', 'materials.item'])
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'category' => $service->category->name,
                'unit' => $service->unit,
                'unit_price' => $service->unit_price,
                // Paper or other materials used per unit, for the "terpakai" line
                'materials' => $service->materials
                    ->filter(fn ($material) => $material->item !== null)
                    ->map(fn ($material) => [
                        'name' => $material->item->name,
                        'unit' => $material->item->unit,
                        'per_unit' => (float) $material->quantity_used_per_unit,
                    ])
                    ->values(),
            ]);

        return Inertia::render('Pos/Index', [
            'items' => $items,
            'services' => $services,
            'paymentMethods' => collect(PaymentMethod::cases())
                ->map(fn (PaymentMethod $method) => ['value' => $method->value, 'label' => $method->label()])
                ->values(),
        ]);
    }

    public function store(Request $request, SaleService $sales): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['array'],
            'items.*.item_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'services' => ['array'],
            'services.*.service_id' => ['required', 'integer'],
            'services.*.qty' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'amount_paid' => ['nullable', 'integer', 'min:0'],
        ]);

        try {
            $sale = $sales->create($request->user(), $data);
        } catch (DomainException $e) {
            // Empty cart, short payment, and low stock all come back as readable messages
            return back()->withErrors(['sale' => $e->getMessage()]);
        }

        return redirect()->route('kasir.pos')
            ->with('success', 'Transaksi #'.$sale->id.' berhasil disimpan.');
    }
}
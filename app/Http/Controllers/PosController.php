<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\Item;
use App\Models\Sale;
use App\Models\Service;
use App\Services\SaleService;
use App\Support\Receipt;
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
                'image_url' => $item->image_path ? \Illuminate\Support\Facades\Storage::disk('public')->url($item->image_path) : null,
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

        return redirect()->route('kasir.pos')->with('recent_receipt', Receipt::for($sale));
    }

    public function struk(Sale $sale): Response
    {
        return Inertia::render('Pos/Struk', [
            'receipt' => Receipt::for($sale),
        ]);
    }

    public function priceList(): Response
    {
        $items = Item::with('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => [
                'kind' => 'barang',
                'name' => $item->name,
                'category' => $item->category->name,
                'unit' => $item->unit,
                'price' => $item->sell_price,
                'stock' => $item->stock,
                'low_stock' => $item->stock <= 5,
            ]);

        $services = Service::with('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => [
                'kind' => 'jasa',
                'name' => $service->name,
                'category' => $service->category->name,
                'unit' => $service->unit,
                'price' => $service->unit_price,
                'stock' => null,
                'low_stock' => false,
            ]);

        return Inertia::render('Pos/PriceList', [
            'rows' => $items->concat($services)->values(),
        ]);
    }

    public function history(Request $request): Response
    {
        $user = $request->user();
        $search = trim((string) $request->query('cari', ''));

        $query = Sale::query()
            ->when(! $user->isAdmin(), fn ($q) => $q->where('user_id', $user->id))
            ->whereDate('transacted_at', today())
            ->when($search !== '', fn ($q) => $q->where('receipt_number', 'like', '%'.$search.'%'));

        $summary = (clone $query)
            ->leftJoin('payments', 'sales_transactions.id', '=', 'payments.sales_id')
            ->selectRaw('
                COUNT(sales_transactions.id) as total_tx,
                COALESCE(SUM(sales_transactions.total_price), 0) as total_omzet,
                COALESCE(SUM(CASE WHEN payments.payment_method = "cash" THEN sales_transactions.total_price ELSE 0 END), 0) as total_cash,
                COALESCE(SUM(CASE WHEN payments.payment_method != "cash" AND payments.payment_method IS NOT NULL THEN sales_transactions.total_price ELSE 0 END), 0) as total_non_cash
            ')
            ->first();

        $sales = $query
            ->with(['user' => fn ($q) => $q->withTrashed(), 'payment', 'itemDetails.item', 'serviceDetails.service'])
            ->orderByDesc('transacted_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Sale $sale) => [
                'id' => $sale->id,
                'receipt_number' => $sale->receipt_number ?? '#'.$sale->id,
                'time' => $sale->transacted_at->format('H:i'),
                'date' => $sale->transacted_at->format('d/m/Y'),
                'cashier' => $sale->user?->name ?? 'Kasir',
                'method' => $sale->payment?->payment_method->label() ?? '-',
                'method_value' => $sale->payment?->payment_method->value ?? 'cash',
                'items_count' => $sale->itemDetails->count() + $sale->serviceDetails->count(),
                'total' => (int) $sale->total_price,
                'receipt' => Receipt::for($sale),
            ]);

        return Inertia::render('Pos/History', [
            'sales' => $sales,
            'search' => $search,
            'summary' => [
                'total_tx' => (int) ($summary->total_tx ?? 0),
                'total_omzet' => (int) ($summary->total_omzet ?? 0),
                'total_cash' => (int) ($summary->total_cash ?? 0),
                'total_non_cash' => (int) ($summary->total_non_cash ?? 0),
            ],
        ]);
    }
}
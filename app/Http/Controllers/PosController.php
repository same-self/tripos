<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\Item;
use App\Models\Service;
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

        $services = Service::with('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'category' => $service->category->name,
                'unit' => $service->unit,
                'unit_price' => $service->unit_price,
            ]);

        return Inertia::render('Pos/Index', [
            'items' => $items,
            'services' => $services,
            'paymentMethods' => collect(PaymentMethod::cases())
                ->map(fn (PaymentMethod $method) => ['value' => $method->value, 'label' => $method->label()])
                ->values(),
        ]);
    }
}
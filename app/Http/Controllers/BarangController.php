<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarangController extends Controller
{
    public function index(Request $request): Response
    {
        $categoryId = $request->query('kategori') ?: null;
        $search = trim((string) $request->query('cari', ''));

        $categories = ItemCategory::withCount('items')
            ->orderBy('name')
            ->get()
            ->map(fn (ItemCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'count' => $category->items_count,
            ]);

        $items = Item::with('category')
            ->when($categoryId, fn ($q) => $q->where('item_category_id', $categoryId))
            ->when($search !== '', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category->name,
                'unit' => $item->unit,
                'cost_price' => $item->cost_price,
                'sell_price' => $item->sell_price,
                'stock' => $item->stock,
                'low_stock' => $item->isLowStock(),
            ]);

        return Inertia::render('Barang/Index', [
            'items' => $items,
            'categories' => $categories,
            'total' => Item::count(),
            'filters' => [
                'kategori' => $categoryId ? (int) $categoryId : null,
                'cari' => $search,
            ],
        ]);
    }
}
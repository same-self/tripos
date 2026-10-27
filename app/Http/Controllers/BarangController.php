<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\ServiceMaterial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                'image_url' => $this->imageUrl($item),
            ]);

        $all = Item::all(['stock', 'min_stock', 'cost_price']);

        return Inertia::render('Barang/Index', [
            'items' => $items,
            'categories' => $categories,
            'total' => Item::count(),
            'summary' => [
                'total' => $all->count(),
                'low_stock' => $all->filter(fn (Item $item) => $item->isLowStock())->count(),
                'stock_value' => (int) $all->sum(fn (Item $item) => $item->stock * $item->cost_price),
                'categories' => $categories->count(),
            ],
            'filters' => [
                'kategori' => $categoryId ? (int) $categoryId : null,
                'cari' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Barang/Form', [
            'item' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules() + $this->imageRules(), $this->messages());

        // New products start at 0 stock; stock changes come from restok and sales
        $item = Item::create(collect($data)->except(['gambar', 'hapus_gambar'])->all());

        if ($request->hasFile('gambar')) {
            $item->forceFill(['image_path' => $request->file('gambar')->store('barang', 'public')])->save();
        }

        return redirect()->route('barang.index')->with('success', 'Barang berhasil ditambahkan.');
    }

    public function edit(Item $item): Response
    {
        return Inertia::render('Barang/Form', [
            'item' => [
                'id' => $item->id,
                'item_category_id' => $item->item_category_id,
                'name' => $item->name,
                'unit' => $item->unit,
                'cost_price' => $item->cost_price,
                'sell_price' => $item->sell_price,
                'min_stock' => $item->min_stock,
                'stock' => $item->stock,
                'image_url' => $this->imageUrl($item),
            ],
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(Request $request, Item $item): RedirectResponse
    {
        $data = $request->validate($this->rules() + $this->imageRules(), $this->messages());

        $item->update(collect($data)->except(['gambar', 'hapus_gambar'])->all());

        if ($request->hasFile('gambar')) {
            $this->deleteImage($item);
            $item->forceFill(['image_path' => $request->file('gambar')->store('barang', 'public')])->save();
        } elseif ($request->boolean('hapus_gambar')) {
            $this->deleteImage($item);
            $item->forceFill(['image_path' => null])->save();
        }

        return redirect()->route('barang.index')->with('success', 'Barang berhasil diubah.');
    }

    public function destroy(Item $item): RedirectResponse
    {
        // A service that still uses this product as material would break its sales
        if (ServiceMaterial::where('item_id', $item->id)->exists()) {
            return back()->withErrors([
                'hapus' => 'Barang "'.$item->name.'" masih dipakai sebagai bahan layanan. Ubah bahan layanannya dulu.',
            ]);
        }

        // Soft delete: old receipts and reports still show the product
        $item->delete();

        return redirect()->route('barang.index')->with('success', 'Barang berhasil dihapus.');
    }

    private function imageUrl(Item $item): ?string
    {
        return $item->image_path ? Storage::disk('public')->url($item->image_path) : null;
    }

    private function deleteImage(Item $item): void
    {
        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }
    }

    private function categoryOptions()
    {
        return ItemCategory::orderBy('name')->get(['id', 'name']);
    }

    private function rules(): array
    {
        return [
            'item_category_id' => ['required', 'exists:item_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'cost_price' => ['required', 'integer', 'min:0'],
            'sell_price' => ['required', 'integer', 'min:1', 'gte:cost_price'],
            'min_stock' => ['required', 'integer', 'min:0'],
        ];
    }

    private function imageRules(): array
    {
        return [
            'gambar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'hapus_gambar' => ['nullable', 'boolean'],
        ];
    }

    private function messages(): array
    {
        return [
            'item_category_id.required' => 'Pilih kategori barang.',
            'item_category_id.exists' => 'Kategori yang dipilih tidak ada.',
            'name.required' => 'Nama barang wajib diisi.',
            'unit.required' => 'Satuan wajib diisi, misalnya buah atau rim.',
            'cost_price.required' => 'Harga modal wajib diisi.',
            'cost_price.integer' => 'Harga modal harus berupa angka bulat.',
            'cost_price.min' => 'Harga modal tidak boleh negatif.',
            'sell_price.required' => 'Harga jual wajib diisi.',
            'sell_price.integer' => 'Harga jual harus berupa angka bulat.',
            'sell_price.min' => 'Harga jual harus lebih dari 0.',
            'sell_price.gte' => 'Harga jual tidak boleh lebih kecil dari harga modal.',
            'min_stock.required' => 'Stok minimum wajib diisi. Isi 0 jika tidak perlu peringatan.',
            'min_stock.integer' => 'Stok minimum harus berupa angka bulat.',
            'min_stock.min' => 'Stok minimum tidak boleh negatif.',
            'gambar.image' => 'File harus berupa gambar.',
            'gambar.mimes' => 'Gambar harus berformat JPG, PNG, atau WEBP.',
            'gambar.max' => 'Ukuran gambar maksimal 2 MB.',
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use App\Support\CategoryIcons;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KategoriController extends Controller
{
    public function index(): Response
    {
        $categories = ItemCategory::withCount('items')
            ->orderBy('name')
            ->get()
            ->map(fn (ItemCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'count' => $category->items_count,
                'icon' => $category->icon,
                'image_url' => $category->imageUrl(),
            ]);

        return Inertia::render('Kategori/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Kategori/Form', ['category' => null, 'icons' => CategoryIcons::ALL]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules() + $this->iconRules(), $this->messages());

        $category = ItemCategory::create(['name' => $data['name'], 'icon' => $data['icon'] ?? null]);

        if ($request->hasFile('gambar')) {
            $category->replaceImage($request->file('gambar'));
        }

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit(ItemCategory $kategori): Response
    {
        return Inertia::render('Kategori/Form', [
            'category' => [
                'id' => $kategori->id,
                'name' => $kategori->name,
                'icon' => $kategori->icon,
                'image_url' => $kategori->imageUrl(),
            ],
            'icons' => CategoryIcons::ALL,
        ]);
    }

    public function update(Request $request, ItemCategory $kategori): RedirectResponse
    {
        $data = $request->validate($this->rules($kategori->id) + $this->iconRules(), $this->messages());

        $kategori->update(['name' => $data['name'], 'icon' => $data['icon'] ?? null]);

        if ($request->hasFile('gambar')) {
            $kategori->replaceImage($request->file('gambar'));
        } elseif ($request->boolean('hapus_gambar')) {
            $kategori->removeImage();
        }

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil diubah.');
    }

    public function destroy(ItemCategory $kategori): RedirectResponse
    {
        // A category that still has products cannot be removed, so no product loses its category
        if ($kategori->items()->exists()) {
            return back()->withErrors([
                'hapus' => 'Kategori "'.$kategori->name.'" masih dipakai barang. Pindahkan barangnya dulu.',
            ]);
        }

        $kategori->delete();
        $kategori->removeImage();

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil dihapus.');
    }

    private function rules(?int $ignoreId = null): array
    {
        // A deleted category (soft delete) must not block its name from being used again
        $unique = Rule::unique('item_categories', 'name')->whereNull('deleted_at');

        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [
            'name' => ['required', 'string', 'max:100', $unique],
        ];
    }

    private function iconRules(): array
    {
        return [
            'icon' => ['nullable', 'string', Rule::in(CategoryIcons::ALL)],
            'gambar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'hapus_gambar' => ['nullable', 'boolean'],
        ];
    }

    private function messages(): array
    {
        return [
            'icon.in' => 'Ikon yang dipilih tidak dikenal.',
            'gambar.image' => 'File harus berupa gambar.',
            'gambar.mimes' => 'Gambar harus JPG, PNG, atau WEBP.',
            'gambar.max' => 'Gambar maksimal 2 MB.',
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max' => 'Nama kategori terlalu panjang.',
            'name.unique' => 'Nama kategori sudah dipakai.',
        ];
    }
}

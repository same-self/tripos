<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
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
            ]);

        return Inertia::render('Kategori/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Kategori/Form', ['category' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules(), $this->messages());

        ItemCategory::create($data);

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit(ItemCategory $kategori): Response
    {
        return Inertia::render('Kategori/Form', [
            'category' => ['id' => $kategori->id, 'name' => $kategori->name],
        ]);
    }

    public function update(Request $request, ItemCategory $kategori): RedirectResponse
    {
        $kategori->update($request->validate($this->rules($kategori->id), $this->messages()));

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

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil dihapus.');
    }

    private function rules(?int $ignoreId = null): array
    {
        $unique = Rule::unique('item_categories', 'name');

        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [
            'name' => ['required', 'string', 'max:100', $unique],
        ];
    }

    private function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max' => 'Nama kategori terlalu panjang.',
            'name.unique' => 'Nama kategori sudah dipakai.',
        ];
    }
}

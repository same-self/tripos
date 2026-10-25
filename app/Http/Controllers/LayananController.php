<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LayananController extends Controller
{
    public function index(Request $request): Response
    {
        $categoryId = $request->query('kategori') ?: null;
        $selectedId = $request->query('pilih');

        $categories = ServiceCategory::withCount('services')
            ->orderBy('name')
            ->get()
            ->map(fn (ServiceCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'count' => $category->services_count,
            ]);

        $services = Service::with(['category', 'materials.item'])
            ->when($categoryId, fn ($q) => $q->where('service_category_id', $categoryId))
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'category' => $service->category->name,
                'unit' => $service->unit,
                'unit_price' => $service->unit_price,
                'materials_summary' => $this->materialsSummary($service),
            ]);

        $detail = null;
        $selected = $selectedId ? Service::with(['category', 'materials.item'])->find($selectedId) : null;

        if ($selected) {
            $detail = [
                'id' => $selected->id,
                'name' => $selected->name,
                'category' => $selected->category->name,
                'unit' => $selected->unit,
                'unit_price' => $selected->unit_price,
                'materials' => $selected->materials
                    ->filter(fn ($material) => $material->item !== null)
                    ->map(fn ($material) => [
                        'name' => $material->item->name,
                        'unit' => $material->item->unit,
                        'per_unit' => (float) $material->quantity_used_per_unit,
                    ])
                    ->values(),
            ];
        }

        return Inertia::render('Layanan/Index', [
            'services' => $services,
            'categories' => $categories,
            'total' => Service::count(),
            'detail' => $detail,
            'autoDeduct' => Setting::bool('auto_deduct_service_materials', true),
            'filters' => [
                'kategori' => $categoryId ? (int) $categoryId : null,
                'pilih' => $detail['id'] ?? null,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Layanan/Form', [
            'service' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules(), $this->messages());

        Service::create($data);

        return redirect()->route('layanan.index')->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('Layanan/Form', [
            'service' => [
                'id' => $service->id,
                'service_category_id' => $service->service_category_id,
                'name' => $service->name,
                'unit' => $service->unit,
                'unit_price' => $service->unit_price,
            ],
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $service->update($request->validate($this->rules(), $this->messages()));

        return redirect()
            ->route('layanan.index', ['pilih' => $service->id])
            ->with('success', 'Layanan berhasil diubah.');
    }

    public function updateSetting(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'auto_deduct' => ['required', 'boolean'],
        ]);

        Setting::put('auto_deduct_service_materials', $data['auto_deduct']);

        return back()->with('success', 'Pengaturan stok bahan diperbarui.');
    }

    private function materialsSummary(Service $service): ?string
    {
        $material = $service->materials->first(fn ($m) => $m->item !== null);

        if (! $material) {
            return null;
        }

        // 0,0020 becomes 0,002 and 1,0000 becomes 1
        $amount = rtrim(rtrim(number_format((float) $material->quantity_used_per_unit, 4, ',', '.'), '0'), ',');

        return $material->item->name.' · '.$amount.' '.$material->item->unit;
    }

    private function categoryOptions()
    {
        return ServiceCategory::orderBy('name')->get(['id', 'name']);
    }

    private function rules(): array
    {
        return [
            'service_category_id' => ['required', 'exists:service_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'unit_price' => ['required', 'integer', 'min:0'],
        ];
    }

    private function messages(): array
    {
        return [
            'service_category_id.required' => 'Pilih kategori layanan.',
            'service_category_id.exists' => 'Kategori yang dipilih tidak ada.',
            'name.required' => 'Nama layanan wajib diisi.',
            'unit.required' => 'Satuan wajib diisi, misalnya lembar atau halaman.',
            'unit_price.required' => 'Tarif wajib diisi.',
            'unit_price.integer' => 'Tarif harus berupa angka bulat.',
            'unit_price.min' => 'Tarif tidak boleh negatif.',
        ];
    }
}
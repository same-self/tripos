<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('cari', ''));
        $selectedId = $request->query('pilih');

        $suppliers = Supplier::query()
            ->withMax('purchases as last_purchase_at', 'transacted_at')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->get()
            ->map(fn (Supplier $supplier) => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'phone' => $supplier->phone_number,
                'last_purchase' => $supplier->last_purchase_at
                    ? Carbon::parse($supplier->last_purchase_at)->locale('id')->translatedFormat('j M Y')
                    : null,
            ]);

        $detail = null;

        if ($selectedId) {
            $supplier = Supplier::with(['purchases' => fn ($q) => $q->latest('transacted_at')->withCount('details')])
                ->find($selectedId);

            if ($supplier) {
                $detail = [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                    'phone' => $supplier->phone_number,
                    'address' => $supplier->address,
                    'purchases' => $supplier->purchases->take(3)->map(fn ($purchase) => [
                        'date' => $purchase->transacted_at->locale('id')->translatedFormat('j M Y'),
                        'kinds' => $purchase->details_count,
                        'total' => (int) $purchase->total_price,
                    ])->values(),
                ];
            }
        }

        return Inertia::render('Supplier/Index', [
            'suppliers' => $suppliers,
            'detail' => $detail,
            'filters' => [
                'cari' => $search,
                'pilih' => $detail['id'] ?? null,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Supplier/Form', [
            'supplier' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules(), $this->messages());

        Supplier::create($data);

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('Supplier/Form', [
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'phone_number' => $supplier->phone_number,
                'address' => $supplier->address,
            ],
        ]);
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($request->validate($this->rules(), $this->messages()));

        return redirect()
            ->route('supplier.index', ['pilih' => $supplier->id])
            ->with('success', 'Supplier berhasil diubah.');
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
        ];
    }

    private function messages(): array
    {
        return [
            'name.required' => 'Nama supplier wajib diisi.',
            'name.max' => 'Nama supplier terlalu panjang.',
            'phone_number.max' => 'Nomor telepon terlalu panjang.',
            'address.max' => 'Alamat terlalu panjang.',
        ];
    }
}
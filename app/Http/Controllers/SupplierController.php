<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
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
            ->withCount('purchases')
            ->withSum('purchases as total_spend', 'total_price')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->get()
            ->map(fn (Supplier $supplier) => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'phone' => $supplier->phone_number,
                'address' => $supplier->address,
                'purchases_count' => (int) $supplier->purchases_count,
                'total_spend' => (int) ($supplier->total_spend ?? 0),
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
                    'purchases_count' => $supplier->purchases->count(),
                    'total_spend' => (int) $supplier->purchases->sum('total_price'),
                    'purchases' => $supplier->purchases->take(5)->map(fn ($purchase) => [
                        'id' => $purchase->id,
                        'date' => $purchase->transacted_at->locale('id')->translatedFormat('j M Y'),
                        'kinds' => $purchase->details_count,
                        'total' => (int) $purchase->total_price,
                    ])->values(),
                ];
            }
        } elseif ($suppliers->isNotEmpty()) {
            $first = Supplier::with(['purchases' => fn ($q) => $q->latest('transacted_at')->withCount('details')])
                ->find($suppliers->first()['id']);

            if ($first) {
                $detail = [
                    'id' => $first->id,
                    'name' => $first->name,
                    'phone' => $first->phone_number,
                    'address' => $first->address,
                    'purchases_count' => $first->purchases->count(),
                    'total_spend' => (int) $first->purchases->sum('total_price'),
                    'purchases' => $first->purchases->take(5)->map(fn ($purchase) => [
                        'id' => $purchase->id,
                        'date' => $purchase->transacted_at->locale('id')->translatedFormat('j M Y'),
                        'kinds' => $purchase->details_count,
                        'total' => (int) $purchase->total_price,
                    ])->values(),
                ];
            }
        }

        $metrics = [
            'total_suppliers' => Supplier::count(),
            'active_suppliers' => Supplier::has('purchases')->count(),
            'total_purchases_count' => Purchase::count(),
            'total_purchases_amount' => (int) Purchase::sum('total_price'),
        ];

        return Inertia::render('Supplier/Index', [
            'suppliers' => $suppliers,
            'detail' => $detail,
            'metrics' => $metrics,
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

    public function destroy(Supplier $supplier): RedirectResponse
    {
        // Soft delete: old purchases still show the supplier's name
        $supplier->delete();

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil dihapus.');
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
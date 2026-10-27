<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\PurchaseService;
use Carbon\Carbon;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RestokController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Restok/Index', [
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'items' => Item::orderBy('name')->get(['id', 'name', 'unit', 'cost_price']),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request, PurchaseService $purchases): RedirectResponse
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            'transacted_at' => ['required', 'date'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.item_id' => ['required', 'integer', 'exists:items,id'],
            'lines.*.qty' => ['required', 'integer', 'min:1'],
            'lines.*.purchase_price' => ['required', 'integer', 'min:0'],
        ], [
            'supplier_id.required' => 'Pilih supplier.',
            'supplier_id.exists' => 'Supplier yang dipilih tidak ada.',
            'transacted_at.required' => 'Tanggal wajib diisi.',
            'transacted_at.date' => 'Tanggal tidak valid.',
            'lines.required' => 'Tambahkan minimal satu barang.',
            'lines.min' => 'Tambahkan minimal satu barang.',
            'lines.*.item_id.required' => 'Pilih barang untuk setiap baris.',
            'lines.*.item_id.exists' => 'Barang yang dipilih tidak ada.',
            'lines.*.qty.required' => 'Jumlah wajib diisi.',
            'lines.*.qty.integer' => 'Jumlah harus berupa angka bulat.',
            'lines.*.qty.min' => 'Jumlah harus lebih dari 0.',
            'lines.*.purchase_price.required' => 'Harga beli wajib diisi.',
            'lines.*.purchase_price.integer' => 'Harga beli harus berupa angka bulat.',
            'lines.*.purchase_price.min' => 'Harga beli tidak boleh negatif.',
        ]);

        try {
            $purchases->create($request->user(), $data);
        } catch (DomainException $e) {
            return back()->withErrors(['restok' => $e->getMessage()])->withInput();
        }

        return redirect()->route('restok.create')->with('success', 'Restok berhasil disimpan. Stok sudah bertambah.');
    }

    public function riwayat(Request $request): Response
    {
        $search = trim((string) $request->query('cari', ''));

        $purchases = Purchase::with([
            'supplier' => fn ($q) => $q->withTrashed(),
            'user' => fn ($q) => $q->withTrashed(),
        ])
            ->withCount('details')
            ->when($search !== '', fn ($q) => $q->whereHas('supplier', fn ($s) => $s->where('name', 'like', '%'.$search.'%')))
            ->orderByDesc('transacted_at')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (Purchase $purchase) => [
                'id' => $purchase->id,
                'date' => Carbon::parse($purchase->transacted_at)->locale('id')->translatedFormat('j M Y'),
                'supplier' => $purchase->supplier?->name ?? '-',
                'kinds' => $purchase->details_count,
                'total' => (int) $purchase->total_price,
                'by' => $purchase->user?->name ?? '-',
            ]);

        return Inertia::render('Restok/Riwayat', [
            'purchases' => $purchases,
            'filters' => ['cari' => $search],
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StokController extends Controller
{
    public function index(): Response
    {
        $window = max(1, Setting::int('report_window_days', 30));
        $fast = Setting::int('fast_moving_threshold', 80);
        $slow = Setting::int('slow_moving_threshold', 10);
        $segeraDays = Setting::int('restok_segera_hari', 7);

        // Same window and join as the dashboard's recommendations
        $start = now()->startOfDay()->subDays($window - 1);
        $end = now()->endOfDay();

        // Every stock movement out in the window: direct sales and paper used by photocopy services
        $sold = DB::table('stock_mutations as m')
            ->where('m.type', 'OUT')
            ->whereBetween('m.created_at', [$start, $end])
            ->groupBy('m.item_id')
            ->selectRaw('m.item_id, SUM(m.amount) as qty')
            ->pluck('qty', 'item_id');

        $rows = Item::with('category')
            ->orderBy('name')
            ->get()
            ->map(function (Item $item) use ($sold, $window, $fast, $slow) {
                $qty = (int) ($sold[$item->id] ?? 0);
                $perDay = $qty / $window;

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'unit' => $item->unit,
                    'stock' => $item->stock,
                    'low_stock' => $item->isLowStock(),
                    'sold' => $qty,
                    'status' => $qty >= $fast ? 'cepat' : ($qty < $slow ? 'lambat' : 'normal'),
                    'cost_price' => $item->cost_price,
                    'sell_price' => $item->sell_price,
                    // Days of stock left at the current sales pace; null when nothing sold
                    'days_left' => $perDay > 0 ? max(0, (int) round($item->stock / $perDay)) : null,
                ];
            })
            ->values();

        $restokSegera = $rows
            ->filter(fn ($row) => $row['days_left'] !== null && $row['days_left'] <= $segeraDays)
            ->sortBy('days_left')
            ->values();

        $restokNanti = $rows
            ->filter(fn ($row) => $row['days_left'] !== null
                && $row['days_left'] > $segeraDays
                && $row['days_left'] <= $window)
            ->sortBy('days_left')
            ->values();

        return Inertia::render('Stok/Index', [
            'items' => $rows,
            'restokSegera' => $restokSegera,
            'restokNanti' => $restokNanti,
            'window' => $window,
            'segeraDays' => $segeraDays,
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Periods offered by the "7 hari / 30 hari" switch on the Dashboard. */
    private const PERIODS = [7, 30];

    public function __invoke(Request $request, ReportService $reports): Response
    {
        // Anything other than 7 or 30 (missing, "abc", 9999) falls back to 30 days.
        $period = (int) $request->query('period', 30);
        $period = in_array($period, self::PERIODS, true) ? $period : 30;

        return Inertia::render('Dashboard', [
            'report' => $reports->dashboard($period),
        ]);
    }
}

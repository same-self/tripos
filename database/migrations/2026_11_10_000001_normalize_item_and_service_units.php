<?php

use App\Support\Units;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Units are now a fixed list. This tidies units typed freely before that, so the same unit is not
 * stored several ways ("buah", "Buah", "pcs"). A unit that matches nothing is left as it was.
 */
return new class extends Migration
{
    private const SYNONYMS = [
        'pcs' => 'Buah', 'pc' => 'Buah', 'piece' => 'Buah', 'pieces' => 'Buah', 'biji' => 'Buah', 'unit' => 'Buah',
        'pak' => 'Pack', 'paket' => 'Pack', 'box' => 'Dus', 'kardus' => 'Dus', 'm' => 'Meter', 'mtr' => 'Meter',
        'lbr' => 'Lembar', 'sheet' => 'Lembar', 'hal' => 'Halaman',
    ];

    public function up(): void
    {
        foreach (['items', 'services'] as $table) {
            DB::table($table)->select('id', 'unit')->orderBy('id')->each(function ($row) use ($table) {
                $key = mb_strtolower(trim((string) $row->unit));
                $fixed = Units::canonical($row->unit) ?? (self::SYNONYMS[$key] ?? null);

                if ($fixed !== null && $fixed !== $row->unit) {
                    DB::table($table)->where('id', $row->id)->update(['unit' => $fixed]);
                }
            });
        }
    }

    public function down(): void
    {
        // The old spellings are not recoverable, and the new ones are valid, so there is nothing to undo.
    }
};

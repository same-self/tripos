<?php

namespace App\Support;

/**
 * The fixed list of units (satuan) for items and services.
 *
 * A fixed list stops the same unit being typed several ways ("buah", "Buah", "pcs", "pieces"),
 * which would split reports and filters. To offer another unit, add it here.
 */
final class Units
{
    public const ALL = ['Buah', 'Lembar', 'Rim', 'Pack', 'Dus', 'Botol', 'Meter', 'Halaman', 'Set'];

    /** Match a typed unit to the list ignoring case and spaces ("rim " → "Rim"); null when it isn't on the list. */
    public static function canonical(?string $value): ?string
    {
        $value = mb_strtolower(trim((string) $value));

        foreach (self::ALL as $unit) {
            if (mb_strtolower($unit) === $value) {
                return $unit;
            }
        }

        return null;
    }

    /**
     * Validation rule: the unit must be on the list. A record that already has an older,
     * free-typed unit may keep it, so editing the price doesn't suddenly demand a new unit.
     */
    public static function rule(?string $current = null): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($current) {
            if (self::canonical((string) $value) === null && (string) $value !== (string) $current) {
                $fail('Pilih satuan dari daftar: '.implode(', ', self::ALL).'.');
            }
        };
    }

    /** Store the canonical spelling when the unit is on the list; keep a legacy value as it was. */
    public static function normalize(string $value): string
    {
        return self::canonical($value) ?? $value;
    }
}

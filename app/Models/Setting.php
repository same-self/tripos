<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Key/value rules the owner can change without a code deploy
 * (fast/slow thresholds, whether service materials auto-deduct, ...).
 */
class Setting extends Model
{
    protected $guarded = [];

    public static function getValue(string $key, ?string $default = null): ?string
    {
        $value = static::query()->where('key', $key)->value('value');

        return $value ?? $default;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = static::getValue($key);

        if ($value === null) {
            return $default;
        }

        return in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
    }

    public static function int(string $key, int $default = 0): int
    {
        $value = static::getValue($key);

        return $value === null ? $default : (int) $value;
    }

    public static function put(string $key, string|int|bool $value): void
    {
        $stored = is_bool($value) ? ($value ? '1' : '0') : (string) $value;

        static::query()->updateOrCreate(['key' => $key], ['value' => $stored]);
    }
}

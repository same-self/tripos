<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A sales note (header). Table keeps the name used in your ERD: sales_transactions.
 */
class Sale extends Model
{
    use SoftDeletes;

    protected $table = 'sales_transactions';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'transacted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function itemDetails(): HasMany
    {
        return $this->hasMany(ItemDetail::class, 'sales_id');
    }

    public function serviceDetails(): HasMany
    {
        return $this->hasMany(ServiceDetail::class, 'sales_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'sales_id');
    }
}

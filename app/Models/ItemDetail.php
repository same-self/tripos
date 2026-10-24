<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemDetail extends Model
{
    use SoftDeletes;

    protected $table = 'item_details';

    protected $guarded = [];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sales_id');
    }

    public function item(): BelongsTo
    {
        // withTrashed: an old receipt must still show items deleted later.
        return $this->belongsTo(Item::class)->withTrashed();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemCategory extends Model
{
    use SoftDeletes;

    // Writes go through services/forms that validate input, so mass-assignment is open here.
    protected $guarded = [];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'item_category_id');
    }
}

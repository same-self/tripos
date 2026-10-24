<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCategory extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'service_category_id');
    }
}

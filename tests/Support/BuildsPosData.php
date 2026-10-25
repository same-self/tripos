<?php

namespace Tests\Support;

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceMaterial;
use App\Models\Supplier;
use App\Models\User;

/**
 * Small builders so the tests read like sentences.
 */
trait BuildsPosData
{
    protected function makeCashier(): User
    {
        return User::factory()->cashier()->create();
    }

    protected function makeAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    /** @param  array<string, mixed>  $overrides */
    protected function makeItem(array $overrides = []): Item
    {
        $category = ItemCategory::firstOrCreate(['name' => 'Test Category']);

        return Item::create(array_merge([
            'item_category_id' => $category->id,
            'name' => 'Item '.uniqid(),
            'unit' => 'pcs',
            'cost_price' => 1000,
            'sell_price' => 2500,
            'stock' => 10,
            'min_stock' => 2,
        ], $overrides));
    }

    /** @param  array<string, mixed>  $overrides */
    protected function makeService(array $overrides = []): Service
    {
        $category = ServiceCategory::firstOrCreate(['name' => 'Test Services']);

        return Service::create(array_merge([
            'service_category_id' => $category->id,
            'name' => 'Service '.uniqid(),
            'unit' => 'lembar',
            'unit_price' => 300,
        ], $overrides));
    }

    protected function attachMaterial(Service $service, Item $item, float|int $perUnit): ServiceMaterial
    {
        return ServiceMaterial::create([
            'service_id' => $service->id,
            'item_id' => $item->id,
            'quantity_used_per_unit' => $perUnit,
        ]);
    }

    protected function makeSupplier(): Supplier
    {
        return Supplier::create(['name' => 'Supplier '.uniqid(), 'phone_number' => '0800000']);
    }
}

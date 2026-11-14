<?php

namespace Tests\Feature\Catalog;

use App\Models\Item;
use App\Support\Units;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class UnitListTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private function itemForm(Item $item, array $extra = []): array
    {
        return array_merge([
            'item_category_id' => $item->item_category_id,
            'name' => 'Barang Baru',
            'unit' => 'Buah',
            'cost_price' => 1000,
            'sell_price' => 2000,
            'min_stock' => 0,
        ], $extra);
    }

    public function test_the_item_and_service_forms_receive_the_unit_list(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->get('/barang/tambah')->assertInertia(
            fn (Assert $p) => $p->component('Barang/Form')->where('units', Units::ALL)
        );
        $this->actingAs($admin)->get('/layanan/tambah')->assertInertia(
            fn (Assert $p) => $p->component('Layanan/Form')->where('units', Units::ALL)
        );
    }

    public function test_a_unit_outside_the_list_is_rejected(): void
    {
        $item = $this->makeItem();

        $this->actingAs($this->makeAdmin())
            ->post('/barang', $this->itemForm($item, ['unit' => 'pieces']))
            ->assertSessionHasErrors('unit');

        $this->assertDatabaseMissing('items', ['name' => 'Barang Baru']);
    }

    public function test_different_spellings_are_saved_as_one_unit(): void
    {
        $item = $this->makeItem();

        $this->actingAs($this->makeAdmin())
            ->post('/barang', $this->itemForm($item, ['unit' => ' rIM ']))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('items', ['name' => 'Barang Baru', 'unit' => 'Rim']);
    }

    public function test_an_older_free_typed_unit_can_be_kept_when_editing(): void
    {
        $item = $this->makeItem(['unit' => 'pcs']);

        $this->actingAs($this->makeAdmin())
            ->put("/barang/{$item->id}", $this->itemForm($item, ['unit' => 'pcs', 'sell_price' => 5000]))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('items', ['id' => $item->id, 'unit' => 'pcs', 'sell_price' => 5000]);
    }

    public function test_services_use_the_same_list(): void
    {
        $service = $this->makeService();
        $form = [
            'service_category_id' => $service->service_category_id,
            'name' => 'Jilid',
            'unit' => 'lembar',
            'unit_price' => 1000,
        ];

        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post('/layanan', array_merge($form, ['unit' => 'kg']))->assertSessionHasErrors('unit');
        $this->actingAs($admin)->post('/layanan', $form)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('services', ['name' => 'Jilid', 'unit' => 'Lembar']);
    }

    public function test_the_migration_tidies_old_free_typed_units(): void
    {
        $a = $this->makeItem(['unit' => 'rim']);
        $b = $this->makeItem(['unit' => 'pcs']);
        $c = $this->makeItem(['unit' => 'kodi']);

        (require database_path('migrations/2026_11_10_000001_normalize_item_and_service_units.php'))->up();

        $this->assertSame('Rim', $a->refresh()->unit);
        $this->assertSame('Buah', $b->refresh()->unit);
        $this->assertSame('kodi', $c->refresh()->unit, 'an unknown unit is left for the owner to pick');
    }
}

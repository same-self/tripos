<?php

namespace Tests\Feature\Catalog;

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Service;
use App\Models\Supplier;
use App\Models\User;
use App\Services\PurchaseService;
use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class DeleteTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    public function test_deleting_an_item_is_a_soft_delete_and_old_receipts_still_work(): void
    {
        $admin = $this->makeAdmin();
        $item = $this->makeItem(['stock' => 10]);
        $sale = app(SaleService::class)->create($this->makeCashier(), [
            'items' => [['item_id' => $item->id, 'qty' => 1]],
            'payment_method' => 'qris',
        ]);

        $this->actingAs($admin)->delete("/barang/{$item->id}")->assertRedirect(route('barang.index'));

        $this->assertSoftDeleted($item);
        $this->actingAs($admin)->get("/kasir/struk/{$sale->id}")->assertOk();
        $this->actingAs($admin)->get('/barang')->assertInertia(fn ($page) => $page->has('items', 0));
    }

    public function test_an_item_used_as_service_material_cannot_be_deleted(): void
    {
        $item = $this->makeItem();
        $this->attachMaterial($this->makeService(), $item, 1);

        $this->actingAs($this->makeAdmin())->delete("/barang/{$item->id}")
            ->assertSessionHasErrors('hapus');

        $this->assertNotSoftDeleted($item);
    }

    public function test_deleting_a_service_is_a_soft_delete(): void
    {
        $service = $this->makeService();

        $this->actingAs($this->makeAdmin())->delete("/layanan/{$service->id}")
            ->assertRedirect(route('layanan.index'));

        $this->assertSoftDeleted($service);
        $this->assertSame(0, Service::count());
    }

    public function test_a_category_with_items_cannot_be_deleted_but_an_empty_one_can(): void
    {
        $admin = $this->makeAdmin();
        $used = ItemCategory::create(['name' => 'Dipakai']);
        $empty = ItemCategory::create(['name' => 'Kosong']);
        $this->makeItem(['item_category_id' => $used->id]);

        $this->actingAs($admin)->delete("/kategori/{$used->id}")->assertSessionHasErrors('hapus');
        $this->assertNotSoftDeleted($used);

        $this->actingAs($admin)->delete("/kategori/{$empty->id}")->assertRedirect(route('kategori.index'));
        $this->assertSoftDeleted($empty);
    }

    public function test_a_deleted_category_name_can_be_used_again(): void
    {
        $admin = $this->makeAdmin();
        $old = ItemCategory::create(['name' => 'Map']);

        $this->actingAs($admin)->delete("/kategori/{$old->id}");
        $this->actingAs($admin)->post('/kategori', ['name' => 'Map'])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('kategori.index'));

        $this->assertSame(1, ItemCategory::where('name', 'Map')->count());
    }

    public function test_two_live_categories_still_cannot_share_a_name(): void
    {
        ItemCategory::create(['name' => 'Map']);

        $this->actingAs($this->makeAdmin())->post('/kategori', ['name' => 'Map'])
            ->assertSessionHasErrors('name');
    }

    public function test_deleting_a_supplier_keeps_the_name_on_old_restock_notes(): void
    {
        $admin = $this->makeAdmin();
        $supplier = $this->makeSupplier();
        $item = $this->makeItem();
        app(PurchaseService::class)->create($admin, [
            'supplier_id' => $supplier->id,
            'lines' => [['item_id' => $item->id, 'qty' => 5, 'purchase_price' => 900]],
        ]);

        $this->actingAs($admin)->delete("/supplier/{$supplier->id}")->assertRedirect(route('supplier.index'));

        $this->assertSoftDeleted($supplier);
        $this->actingAs($admin)->get('/restok/riwayat')
            ->assertInertia(fn ($page) => $page->where('purchases.0.supplier', $supplier->name));
    }

    public function test_a_user_without_history_is_removed_but_one_with_history_is_refused(): void
    {
        $admin = $this->makeAdmin();
        $fresh = $this->makeCashier();
        $busy = $this->makeCashier();
        $item = $this->makeItem();
        app(SaleService::class)->create($busy, ['items' => [['item_id' => $item->id, 'qty' => 1]], 'payment_method' => 'qris']);

        $this->actingAs($admin)->delete("/pengguna/{$fresh->id}")->assertRedirect(route('pengguna.index'));
        $this->assertNull(User::withTrashed()->find($fresh->id));

        $this->actingAs($admin)->delete("/pengguna/{$busy->id}")->assertSessionHasErrors('hapus');
        $this->assertNotNull(User::find($busy->id));
    }

    public function test_an_admin_cannot_delete_their_own_account_from_the_user_list(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->delete("/pengguna/{$admin->id}")->assertSessionHasErrors('hapus');
        $this->assertNotNull(User::find($admin->id));
    }

    public function test_a_cashier_cannot_delete_anything(): void
    {
        $cashier = $this->makeCashier();
        $item = $this->makeItem();
        $service = $this->makeService();
        $supplier = $this->makeSupplier();
        $category = ItemCategory::create(['name' => 'X']);

        $this->actingAs($cashier);
        $this->delete("/barang/{$item->id}")->assertForbidden();
        $this->delete("/layanan/{$service->id}")->assertForbidden();
        $this->delete("/supplier/{$supplier->id}")->assertForbidden();
        $this->delete("/kategori/{$category->id}")->assertForbidden();
        $this->delete("/pengguna/{$this->makeAdmin()->id}")->assertForbidden();

        $this->assertNotSoftDeleted($item);
        $this->assertNotSoftDeleted($service);
        $this->assertNotSoftDeleted($supplier);
    }
}

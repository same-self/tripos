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
        $this->actingAs($admin)->get("/riwayat/{$sale->id}")->assertOk();
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

    public function test_a_user_is_removed_and_history_is_kept(): void
    {
        $admin = $this->makeAdmin();
        $fresh = $this->makeCashier();
        $busy = $this->makeCashier();
        $item = $this->makeItem();
        app(SaleService::class)->create($busy, ['items' => [['item_id' => $item->id, 'qty' => 1]], 'payment_method' => 'qris']);

        $this->actingAs($admin)->delete("/pengguna/{$fresh->id}")->assertRedirect(route('pengguna.index'));
        $this->assertNull(User::withTrashed()->find($fresh->id));

        $this->actingAs($admin)->delete("/pengguna/{$busy->id}")->assertRedirect(route('pengguna.index'));
        // Akun hilang dari daftar dan tidak bisa login, tetapi transaksinya tetap ada
        $this->assertSoftDeleted($busy);
        $this->assertNotNull(User::withTrashed()->find($busy->id)->removed_at);
        $this->assertDatabaseCount('sales_transactions', 1);
        $this->actingAs($admin)->get('/pengguna')
            ->assertInertia(fn ($page) => $page->has('users', 1));
    }

    public function test_the_owner_account_is_hard_wired_and_untouchable_by_other_admins(): void
    {
        $owner = $this->makeAdmin();
        $owner->forceFill(['is_super_admin' => true])->save();
        $other = $this->makeAdmin();

        $this->actingAs($other)->delete("/pengguna/{$owner->id}")->assertForbidden();
        $this->actingAs($other)->get("/pengguna/{$owner->id}/ubah")->assertForbidden();
        $this->actingAs($other)->put("/pengguna/{$owner->id}", [
            'name' => 'X', 'username' => $owner->username, 'role' => 'cashier', 'active' => false,
        ])->assertForbidden();
        $this->assertNotNull(User::find($owner->id));
        $this->assertSame('admin', $owner->fresh()->role->value);

        $this->actingAs($other)->get('/pengguna')->assertInertia(fn ($page) => $page
            ->where('users', fn ($users) => collect($users)->firstWhere('id', $owner->id)['can_edit'] === false
                && collect($users)->firstWhere('id', $owner->id)['can_delete'] === false));
    }

    public function test_the_owner_model_cannot_lose_admin_role_or_be_deactivated(): void
    {
        $owner = $this->makeAdmin();
        $owner->forceFill(['is_super_admin' => true])->save();

        $owner->forceFill(['role' => 'cashier'])->save();
        $this->assertSame('admin', $owner->fresh()->role->value);

        $this->assertFalse($owner->delete());
        $this->assertNull($owner->fresh()->deleted_at);
    }

    public function test_the_owner_can_still_edit_their_own_name_but_not_role_or_status(): void
    {
        $owner = $this->makeAdmin();
        $owner->forceFill(['is_super_admin' => true])->save();

        $this->actingAs($owner)->put("/pengguna/{$owner->id}", [
            'name' => 'Nama Baru', 'username' => $owner->username, 'role' => 'admin', 'active' => true,
        ])->assertRedirect(route('pengguna.index'));
        $this->assertSame('Nama Baru', $owner->fresh()->name);

        $this->actingAs($owner)->put("/pengguna/{$owner->id}", [
            'name' => 'Nama Baru', 'username' => $owner->username, 'role' => 'cashier', 'active' => false,
        ])->assertSessionHasErrors('role');
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

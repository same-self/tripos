<?php

namespace Tests\Feature\Catalog;

use App\Models\Item;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class ImageUploadTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    /**
     * A tiny but genuine PNG. UploadedFile::fake()->image() needs the PHP "gd" extension,
     * which is not switched on in every Laragon install; a real file does not.
     */
    private function picture(string $name = 'foto.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
        );
    }

    private function itemForm(Item $item, array $extra = []): array
    {
        return array_merge([
            'item_category_id' => $item->item_category_id,
            'name' => $item->name,
            'unit' => 'Buah', // a fixed unit, so these tests don't depend on what the test helper uses
            'cost_price' => $item->cost_price,
            'sell_price' => $item->sell_price,
            'min_stock' => $item->min_stock,
        ], $extra);
    }

    public function test_new_item_can_be_saved_with_a_picture(): void
    {
        $item = $this->makeItem();

        $this->actingAs($this->makeAdmin())
            ->post('/barang', $this->itemForm($item, ['name' => 'Pulpen Gel', 'gambar' => $this->picture('pulpen.png')]))
            ->assertRedirect(route('barang.index'));

        $saved = Item::where('name', 'Pulpen Gel')->firstOrFail();

        $this->assertStringStartsWith('barang/', $saved->image_path);
        Storage::disk('public')->assertExists($saved->image_path);
    }

    public function test_picture_urls_are_relative_so_they_work_on_any_host(): void
    {
        $item = $this->makeItem();
        $item->forceFill(['image_path' => 'barang/a.jpg'])->save();

        // No http://host in front: an address like that breaks every picture when the site is
        // opened on another host (127.0.0.1 instead of localhost, tripos.test, a real domain).
        $this->assertSame('/media/barang/a.jpg', $item->imageUrl());
        $this->assertNull($this->makeItem()->imageUrl());
    }

    public function test_replacing_a_picture_deletes_the_old_file(): void
    {
        $admin = $this->makeAdmin();
        $item = $this->makeItem();
        $item->replaceImage($this->picture('old.png'));
        $oldPath = $item->image_path;

        $this->actingAs($admin)
            ->post("/barang/{$item->id}", $this->itemForm($item, ['_method' => 'put', 'gambar' => $this->picture('new.png')]))
            ->assertRedirect(route('barang.index'));

        $item->refresh();

        $this->assertNotSame($oldPath, $item->image_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($item->image_path);
    }

    public function test_picture_can_be_removed(): void
    {
        $item = $this->makeItem();
        $item->replaceImage($this->picture('old.png'));
        $oldPath = $item->image_path;

        $this->actingAs($this->makeAdmin())
            ->put("/barang/{$item->id}", $this->itemForm($item, ['hapus_gambar' => 1]))
            ->assertRedirect(route('barang.index'));

        $this->assertNull($item->fresh()->image_path);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_editing_without_touching_the_picture_keeps_it(): void
    {
        $item = $this->makeItem();
        $item->replaceImage($this->picture('keep.png'));
        $path = $item->image_path;

        $this->actingAs($this->makeAdmin())
            ->put("/barang/{$item->id}", $this->itemForm($item, ['name' => 'Nama baru']))
            ->assertRedirect(route('barang.index'));

        $this->assertSame($path, $item->fresh()->image_path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_only_small_images_are_accepted(): void
    {
        $admin = $this->makeAdmin();
        $item = $this->makeItem();

        $this->actingAs($admin)
            ->post('/barang', $this->itemForm($item, ['gambar' => UploadedFile::fake()->create('berkas.pdf', 100, 'application/pdf')]))
            ->assertSessionHasErrors('gambar');

        $this->actingAs($admin)
            ->post('/barang', $this->itemForm($item, ['gambar' => UploadedFile::fake()->create('besar.jpg', 3000, 'image/jpeg')]))
            ->assertSessionHasErrors('gambar');
    }

    public function test_service_picture_upload_replace_and_remove(): void
    {
        $admin = $this->makeAdmin();
        $service = $this->makeService();
        $form = [
            'service_category_id' => $service->service_category_id,
            'name' => $service->name,
            'unit' => 'Lembar',
            'unit_price' => $service->unit_price,
        ];

        $this->actingAs($admin)
            ->post('/layanan', array_merge($form, ['name' => 'Jilid Spiral', 'gambar' => $this->picture('jilid.png')]))
            ->assertRedirect(route('layanan.index'));

        $created = Service::where('name', 'Jilid Spiral')->firstOrFail();
        $first = $created->image_path;
        $this->assertStringStartsWith('layanan/', $first);
        Storage::disk('public')->assertExists($first);

        $this->actingAs($admin)
            ->post("/layanan/{$created->id}", array_merge($form, ['name' => 'Jilid Spiral', '_method' => 'put', 'gambar' => $this->picture('b.png')]));
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($created->fresh()->image_path);

        $this->actingAs($admin)
            ->put("/layanan/{$created->id}", array_merge($form, ['name' => 'Jilid Spiral', 'hapus_gambar' => 1]));
        $this->assertNull($created->fresh()->image_path);
    }

    public function test_pos_and_price_list_receive_picture_urls_for_items_and_services(): void
    {
        $item = $this->makeItem(['name' => 'Penghapus']);
        $item->forceFill(['image_path' => 'barang/p.jpg'])->save();
        $service = $this->makeService(['name' => 'Fotokopi A4']);
        $service->forceFill(['image_path' => 'layanan/f.jpg'])->save();
        $cashier = $this->makeCashier();

        $this->actingAs($cashier)->get('/kasir/pos')
            ->assertInertia(fn (Assert $page) => $page
                ->where('items.0.image_url', '/media/barang/p.jpg')
                ->where('services.0.image_url', '/media/layanan/f.jpg'));

        $this->actingAs($cashier)->get('/kasir/harga')
            ->assertInertia(fn (Assert $page) => $page
                ->where('rows.0.image_url', '/media/barang/p.jpg')
                ->where('rows.1.image_url', '/media/layanan/f.jpg'));
    }

    public function test_a_cashier_cannot_upload_pictures(): void
    {
        $item = $this->makeItem();

        $this->actingAs($this->makeCashier())
            ->post('/barang', $this->itemForm($item, ['gambar' => $this->picture('x.png')]))
            ->assertForbidden();
    }
}
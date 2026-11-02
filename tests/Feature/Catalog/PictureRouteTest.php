<?php

namespace Tests\Feature\Catalog;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Pictures are served by the app (the "media" route), so they load even when the public/storage
 * link (php artisan storage:link) was never made or is broken.
 */
class PictureRouteTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_a_stored_picture_is_served_without_the_storage_link(): void
    {
        Storage::disk('public')->put('barang/foto.png', base64_decode(self::PNG));

        $this->get('/media/barang/foto.png')
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    }

    public function test_service_pictures_are_served_too_and_no_login_is_needed(): void
    {
        Storage::disk('public')->put('layanan/jilid.png', base64_decode(self::PNG));

        $this->get('/media/layanan/jilid.png')->assertOk();
    }

    public function test_a_missing_picture_is_a_plain_404(): void
    {
        $this->get('/media/barang/tidak-ada.png')->assertNotFound();
    }

    public function test_nothing_outside_the_two_picture_folders_can_be_read(): void
    {
        Storage::disk('public')->put('rahasia/data.txt', 'rahasia');
        Storage::disk('public')->put('foto-lepas.png', base64_decode(self::PNG));

        $this->get('/media/rahasia/data.txt')->assertNotFound();
        $this->get('/media/foto-lepas.png')->assertNotFound();
        $this->get('/media/barang/../rahasia/data.txt')->assertNotFound();
        $this->get('/media/barang/..')->assertNotFound();
        $this->get('/media/.env')->assertNotFound();
    }
}

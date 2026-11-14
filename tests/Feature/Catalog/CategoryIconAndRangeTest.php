<?php

namespace Tests\Feature\Catalog;

use App\Models\ItemCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class CategoryIconAndRangeTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    public function test_a_category_can_be_saved_with_a_preset_icon(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->post('/kategori', ['name' => 'Gunting', 'icon' => 'scissors'])->assertRedirect(route('kategori.index'));

        $this->assertSame('scissors', ItemCategory::where('name', 'Gunting')->first()->icon);
    }

    public function test_an_unknown_icon_is_rejected(): void
    {
        $this->actingAs($this->makeAdmin())->post('/kategori', ['name' => 'Aneh', 'icon' => 'bukan-ikon'])->assertSessionHasErrors('icon');
    }

    public function test_a_custom_picture_can_be_uploaded_and_is_shared_to_every_page(): void
    {
        if (! function_exists('imagecreatetruecolor')) {
            $this->markTestSkipped('GD tidak tersedia.');
        }

        Storage::fake('public');
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->post('/kategori', [
            'name' => 'Logo', 'gambar' => UploadedFile::fake()->image('ikon.png', 64, 64),
        ])->assertRedirect(route('kategori.index'));

        $category = ItemCategory::where('name', 'Logo')->first();
        $this->assertNotNull($category->image_path);
        $this->actingAs($admin)->get('/kategori')
            ->assertInertia(fn ($page) => $page->where('categoryIcons.Logo.image_url', fn ($url) => str_starts_with($url, '/media/kategori/')));
    }

    public function test_laporan_accepts_a_custom_date_range(): void
    {
        $admin = $this->makeAdmin();
        $dari = now()->subDays(2)->toDateString();
        $sampai = now()->toDateString();

        $this->actingAs($admin)->get("/laporan?tab=penjualan&dari={$dari}&sampai={$sampai}")
            ->assertInertia(fn ($page) => $page
                ->where('dari', $dari)->where('sampai', $sampai)->where('periode', 3)
                ->has('penjualan.days', 3));

        // Tanggal tidak valid dianggap tidak ada: kembali ke 7 hari
        $this->actingAs($admin)->get('/laporan?dari=abc&sampai=xyz')
            ->assertInertia(fn ($page) => $page->where('dari', null)->where('periode', 7));
    }

    public function test_riwayat_filters_by_date_range(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->get('/riwayat?dari=2000-01-01&sampai=2000-01-02')
            ->assertInertia(fn ($page) => $page
                ->where('filters.periode', 'rentang')->where('totals.count', 0));
    }
}

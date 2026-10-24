<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceMaterial;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

/**
 * SAMPLE DATA ONLY. Names and prices are made up so every screen has something to show;
 * replace them with the owner's real price list.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $paper = ItemCategory::firstOrCreate(['name' => 'Kertas']);
        $stationery = ItemCategory::firstOrCreate(['name' => 'Alat Tulis']);
        $accessory = ItemCategory::firstOrCreate(['name' => 'Aksesoris Komputer']);

        $hvs = $this->item($paper, 'HVS A4 80gr', 'lembar', 300, 500, 2500, 500, '8990000000011');
        $this->item($paper, 'HVS F4 80gr', 'lembar', 350, 600, 1500, 300, '8990000000028');
        $this->item($stationery, 'Pulpen Hitam', 'pcs', 2000, 3000, 60, 10, '8990000000035');
        $this->item($stationery, 'Buku Tulis 38 Lembar', 'pcs', 3500, 5000, 40, 10, '8990000000042');
        $this->item($stationery, 'Map Plastik', 'pcs', 1500, 2500, 8, 10, '8990000000059'); // low stock on purpose
        $this->item($accessory, 'Flashdisk 16GB', 'pcs', 45000, 60000, 6, 3, '8990000000066');

        $copy = ServiceCategory::firstOrCreate(['name' => 'Fotokopi & Print']);
        $finishing = ServiceCategory::firstOrCreate(['name' => 'Jilid & Cetak']);

        $fotokopi = $this->service($copy, 'Fotokopi A4 Hitam Putih', 'lembar', 300);
        $print = $this->service($copy, 'Print A4 Hitam Putih', 'lembar', 500);
        $this->service($finishing, 'Jilid Spiral', 'buku', 8000);
        $this->service($finishing, 'Cetak Banner', 'meter', 25000);

        // The "recipe": 1 sheet of A4 paper per page copied or printed.
        foreach ([$fotokopi, $print] as $service) {
            ServiceMaterial::firstOrCreate(
                ['service_id' => $service->id, 'item_id' => $hvs->id],
                ['quantity_used_per_unit' => 1],
            );
        }

        Supplier::firstOrCreate(
            ['name' => 'Toko Grosir ATK Cileungsi'],
            ['phone_number' => '081200000000', 'address' => 'Cileungsi, Kab. Bogor'],
        );
    }

    private function item(ItemCategory $cat, string $name, string $unit, int $cost, int $sell, int $stock, int $min, string $barcode): Item
    {
        return Item::updateOrCreate(
            ['barcode' => $barcode],
            [
                'item_category_id' => $cat->id,
                'name' => $name,
                'unit' => $unit,
                'cost_price' => $cost,
                'sell_price' => $sell,
                'stock' => $stock,
                'min_stock' => $min,
            ],
        );
    }

    private function service(ServiceCategory $cat, string $name, string $unit, int $price): Service
    {
        return Service::updateOrCreate(
            ['name' => $name],
            ['service_category_id' => $cat->id, 'unit' => $unit, 'unit_price' => $price],
        );
    }
}

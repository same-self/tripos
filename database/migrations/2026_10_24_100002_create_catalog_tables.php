<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_category_id')->constrained('item_categories');
            $table->string('name');
            $table->string('barcode', 64)->nullable()->unique();
            $table->string('unit', 50);
            // Rupiah has no cents -> whole numbers avoid rounding errors.
            $table->unsignedBigInteger('cost_price')->default(0);   // harga modal
            $table->unsignedBigInteger('sell_price');               // harga jual
            // Signed on purpose: late data entry can push the system count below zero.
            $table->integer('stock')->default(0);
            $table->unsignedInteger('min_stock')->default(0);       // restock alert threshold
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
        });

        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')->constrained('service_categories');
            $table->string('name');
            $table->string('unit', 50);
            $table->unsignedBigInteger('unit_price');
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
        });

        // The "recipe" of a service: e.g. 1 photocopy page uses 1 sheet of A4 paper.
        Schema::create('service_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services');
            $table->foreignId('item_id')->constrained('items');
            $table->decimal('quantity_used_per_unit', 10, 4);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_materials');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
        Schema::dropIfExists('items');
        Schema::dropIfExists('item_categories');
    }
};

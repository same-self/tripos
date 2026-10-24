<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items');
            // IN / OUT are stored positive. ADJUSTMENT may be negative (stock-count correction).
            $table->integer('amount');
            $table->string('source', 100);          // Sales | Purchase | Service | Adjustment
            $table->string('type', 20);             // IN | OUT | ADJUSTMENT
            $table->unsignedBigInteger('reference_id')->nullable();  // sale or purchase id
            $table->integer('balance_after');       // stock level right after this movement
            $table->string('note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['item_id', 'created_at']);
        });

        // Owner-editable rules, so thresholds are not hard-coded in the app.
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('stock_mutations');
    }
};

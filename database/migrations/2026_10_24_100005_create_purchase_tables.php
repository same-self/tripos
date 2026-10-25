<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->string('invoice_number', 60)->nullable();   // supplier's invoice, optional
            $table->unsignedBigInteger('total_price');
            $table->timestamp('transacted_at')->useCurrent()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchase_transactions');
            $table->foreignId('item_id')->constrained('items');
            $table->unsignedInteger('amount');
            $table->unsignedBigInteger('purchase_price');   // was misnamed sell_price in the old dump
            $table->unsignedBigInteger('subtotal');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_details');
        Schema::dropIfExists('purchase_transactions');
    }
};

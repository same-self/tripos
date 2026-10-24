<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            // Filled right after insert from the row id, e.g. TRX-20261024-00042.
            $table->string('receipt_number', 40)->nullable()->unique();
            $table->unsignedBigInteger('total_price');
            // Separate from created_at so the owner can enter paper notes later.
            $table->timestamp('transacted_at')->useCurrent()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('item_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->constrained('sales_transactions');
            $table->foreignId('item_id')->constrained('items');
            $table->unsignedInteger('amount');
            $table->unsignedBigInteger('sell_price');   // price snapshot at time of sale
            $table->unsignedBigInteger('cost_price')->default(0); // cost snapshot -> profit reports
            $table->unsignedBigInteger('subtotal');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('service_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->constrained('sales_transactions');
            $table->foreignId('service_id')->constrained('services');
            $table->unsignedInteger('amount');
            $table->unsignedBigInteger('unit_price');   // price snapshot at time of sale
            $table->unsignedBigInteger('subtotal');
            $table->timestamps();
            $table->softDeletes();
        });

        // One payment per sale. `change` is a reserved SQL word, so the column is change_amount.
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->unique()->constrained('sales_transactions');
            $table->string('payment_method', 20);       // cash | qris
            $table->unsignedBigInteger('amount_paid');
            $table->unsignedBigInteger('change_amount')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('service_details');
        Schema::dropIfExists('item_details');
        Schema::dropIfExists('sales_transactions');
    }
};

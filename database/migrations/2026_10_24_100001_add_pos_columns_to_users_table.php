<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * The kit already creates `users`, and 2026_10_24_083541_add_username_to_users_table.php
 * already adds `username`, so this migration only adds what is still missing.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('cashier');
            $table->boolean('must_change_password')->default(false);
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'must_change_password', 'deleted_at']);
        });
    }
};

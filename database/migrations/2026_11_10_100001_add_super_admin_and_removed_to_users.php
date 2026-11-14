<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // The shop owner's account: it can never be deleted, deactivated or demoted
            $table->boolean('is_super_admin')->default(false)->after('role');
            // A deleted account that still has sales or purchases: kept (so old receipts keep the name) but hidden
            $table->timestamp('removed_at')->nullable()->after('deleted_at');
        });

        // Existing installs: the oldest admin account is the owner
        $ownerId = DB::table('users')->where('role', 'admin')->orderBy('id')->value('id');

        if ($ownerId) {
            DB::table('users')->where('id', $ownerId)->update(['is_super_admin' => true]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_super_admin', 'removed_at']);
        });
    }
};

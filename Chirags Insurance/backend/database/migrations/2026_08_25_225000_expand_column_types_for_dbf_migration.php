<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('horse_power', 50)->nullable()->change();
            $table->decimal('rlw', 15, 2)->nullable()->change();
            $table->decimal('uw', 15, 2)->nullable()->change();
            $table->decimal('plw', 15, 2)->nullable()->change();
            $table->string('cylinder', 50)->nullable()->change();
            $table->string('s_c_ind', 50)->nullable()->change();
        });

        Schema::table('insurance_policies', function (Blueprint $table) {
            $table->string('ncb', 50)->nullable()->change();
            $table->decimal('sum_insured', 15, 2)->nullable()->change();
            $table->decimal('total_premium', 15, 2)->nullable()->change();
            $table->decimal('od_tp_premium', 15, 2)->nullable()->change();
            $table->decimal('trolley_amount', 15, 2)->nullable()->change();
            $table->decimal('other_amount', 15, 2)->nullable()->change();
            $table->decimal('service_tax', 15, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
    }
};

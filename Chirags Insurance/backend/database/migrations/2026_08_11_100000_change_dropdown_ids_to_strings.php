<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->string('class_id')->nullable()->change();
        });

        Schema::table('insurance_policies', function (Blueprint $table) {
            $table->dropForeign(['insurance_company_id']);
            $table->string('insurance_company_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Reverting this might cause data loss if alphanumeric strings were stored.
        // We will just change it back to integer.
        Schema::table('vehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('class_id')->nullable()->change();
            $table->foreign('class_id')->references('id')->on('vehicle_classes')->nullOnDelete();
        });

        Schema::table('insurance_policies', function (Blueprint $table) {
            $table->unsignedBigInteger('insurance_company_id')->nullable()->change();
            $table->foreign('insurance_company_id')->references('id')->on('insurance_companies')->nullOnDelete();
        });
    }
};

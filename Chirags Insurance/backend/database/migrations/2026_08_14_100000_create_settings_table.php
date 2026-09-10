<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index(); // e.g. general, tax, vehicle, insurance, rto, document, notification, security
            $table->string('key')->unique();     // e.g. company_name, tax_expiry_warning_period
            $table->text('value')->nullable();   // The actual setting value
            $table->string('type')->default('string'); // e.g. string, boolean, integer, json, array
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

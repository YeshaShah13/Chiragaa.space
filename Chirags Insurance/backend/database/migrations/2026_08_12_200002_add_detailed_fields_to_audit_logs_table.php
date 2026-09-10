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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('entity_name')->nullable()->after('record_id'); // e.g. "Vehicle MH01AB1234"
            $table->string('description')->nullable()->after('entity_name'); // e.g. "Vehicle information updated"
            $table->string('status')->default('Success')->after('user_agent'); // Success or Failed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['entity_name', 'description', 'status']);
        });
    }
};

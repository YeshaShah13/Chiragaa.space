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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('troli_no')->nullable()->after('vehicle_number');
            $table->date('registration_date')->nullable()->after('owner_name');
            $table->date('tractor_registration_date')->nullable()->after('registration_date');
            $table->text('permanent_address')->nullable()->after('phone');
            $table->decimal('horse_power', 8, 2)->nullable()->after('model');
            $table->decimal('rlw', 10, 2)->nullable()->after('horse_power');
            $table->integer('cylinder')->nullable()->after('rlw');
            $table->integer('s_c_ind')->nullable()->after('cylinder');
            $table->decimal('uw', 10, 2)->nullable()->after('s_c_ind');
            $table->decimal('plw', 10, 2)->nullable()->after('engine_number');
            $table->string('hpa_with')->nullable()->after('plw');
            $table->text('remarks')->nullable()->after('hpa_with');
            $table->string('group')->nullable()->after('remarks');
        });

        Schema::table('tax_records', function (Blueprint $table) {
            $table->decimal('penalty', 10, 2)->nullable()->after('amount');
            $table->decimal('interest', 10, 2)->nullable()->after('penalty');
            $table->boolean('yearly')->default(false)->after('interest');
            $table->decimal('yearly_amount', 10, 2)->nullable()->after('yearly');
            $table->boolean('half_yearly')->default(false)->after('yearly_amount');
            $table->decimal('half_yearly_amount', 10, 2)->nullable()->after('half_yearly');
        });

        Schema::table('fitness_records', function (Blueprint $table) {
            $table->string('place')->nullable()->after('passed_by');
        });

        Schema::table('permits', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('permit_number');
            $table->string('receipt_no')->nullable()->after('amount');
        });

        Schema::table('national_permits', function (Blueprint $table) {
            $table->string('city')->nullable()->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'troli_no', 'registration_date', 'tractor_registration_date',
                'permanent_address', 'horse_power', 'rlw', 'cylinder',
                's_c_ind', 'uw', 'plw', 'hpa_with', 'remarks', 'group'
            ]);
        });

        Schema::table('tax_records', function (Blueprint $table) {
            $table->dropColumn([
                'penalty', 'interest', 'yearly', 'yearly_amount',
                'half_yearly', 'half_yearly_amount'
            ]);
        });

        Schema::table('fitness_records', function (Blueprint $table) {
            $table->dropColumn(['place']);
        });

        Schema::table('permits', function (Blueprint $table) {
            $table->dropColumn(['amount', 'receipt_no']);
        });

        Schema::table('national_permits', function (Blueprint $table) {
            $table->dropColumn(['city']);
        });
    }
};

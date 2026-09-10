<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('insurance_policies', function (Blueprint $table) {
            $table->string('receipt_number')->nullable()->after('policy_number');
            $table->string('confirmation_number')->nullable()->after('expiry_date');
            $table->date('confirmation_date')->nullable()->after('confirmation_number');
            $table->date('transfer_date')->nullable()->after('confirmation_date');
            $table->string('group_name')->nullable()->after('transfer_date');
            $table->string('hpa_with')->nullable()->after('group_name');
            $table->text('remarks')->nullable()->after('hpa_with');

            $table->decimal('sum_insured', 12, 2)->default(0)->after('remarks');
            $table->decimal('trolley_amount', 12, 2)->default(0)->after('sum_insured');
            $table->decimal('other_amount', 12, 2)->default(0)->after('trolley_amount');
            $table->decimal('ncb', 12, 2)->default(0)->after('other_amount'); // Treating as amount, not percentage
            $table->decimal('od_tp_premium', 12, 2)->default(0)->after('ncb');
            $table->decimal('service_tax', 12, 2)->default(0)->after('od_tp_premium');
            
            // Reusing the existing premium_amount as total_premium by renaming it
            $table->renameColumn('premium_amount', 'total_premium');
        });
    }

    public function down(): void
    {
        Schema::table('insurance_policies', function (Blueprint $table) {
            $table->renameColumn('total_premium', 'premium_amount');
            $table->dropColumn([
                'receipt_number',
                'confirmation_number',
                'confirmation_date',
                'transfer_date',
                'group_name',
                'hpa_with',
                'remarks',
                'sum_insured',
                'trolley_amount',
                'other_amount',
                'ncb',
                'od_tp_premium',
                'service_tax'
            ]);
        });
    }
};

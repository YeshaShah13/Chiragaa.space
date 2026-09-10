<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsurancePolicy extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id', 
        'insurance_company_id', 
        'policy_number',
        'receipt_number',
        'start_date', 
        'expiry_date', 
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
        'service_tax',
        'total_premium', 
        'is_active',
        'created_by', 
        'updated_by'
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'expiry_date' => 'date',
        'confirmation_date' => 'date',
        'transfer_date' => 'date',
        'is_active' => 'boolean',
        'ncb' => 'string',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function insuranceCompany(): BelongsTo
    {
        return $this->belongsTo(InsuranceCompany::class);
    }
}

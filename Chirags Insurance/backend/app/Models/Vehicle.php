<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicle extends Model
{
    use SoftDeletes;

    protected $appends = ['tax_status', 'tax', 'fitness_status', 'fitness', 'permit_status', 'permit', 'national_permit_status', 'national_permit'];

    protected $fillable = [
        'vehicle_number', 'troli_no', 'owner_name', 'registration_date', 'tractor_registration_date',
        'permanent_address', 'phone', 'make_id', 'class_id',
        'model', 'horse_power', 'rlw', 'cylinder', 's_c_ind', 'uw', 
        'engine_number', 'chassis_number', 'plw', 'status',
        'hpa_with', 'remarks', 'group',
        'created_by', 'updated_by'
    ];

    protected $casts = [
        'registration_date' => 'date',
        'tractor_registration_date' => 'date',
        'horse_power' => 'string',
        'cylinder' => 'string',
        's_c_ind' => 'string',
    ];

    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class);
    }

    public function vehicleClass(): BelongsTo
    {
        return $this->belongsTo(VehicleClass::class, 'class_id');
    }

    public function insurancePolicies(): HasMany
    {
        return $this->hasMany(InsurancePolicy::class);
    }

    public function taxRecords(): HasMany
    {
        return $this->hasMany(TaxRecord::class);
    }

    public function fitnessRecords(): HasMany
    {
        return $this->hasMany(FitnessRecord::class);
    }

    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class);
    }

    public function nationalPermits(): HasMany
    {
        return $this->hasMany(NationalPermit::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function getTaxAttribute()
    {
        $latest = $this->taxRecords()->latest('id')->first();
        if (!$latest) {
            return null;
        }

        return [
            'tax_up_to_date' => $latest->valid_upto,
            'tax_paid_date' => $latest->paid_date,
            'amount' => $latest->amount,
            'penalty' => $latest->penalty,
            'interest' => $latest->interest,
            'receipt_no' => $latest->receipt_number,
            'yearly' => (bool)$latest->yearly,
            'yearly_amount' => $latest->yearly_amount,
            'half_yearly' => (bool)$latest->half_yearly,
            'half_yearly_amount' => $latest->half_yearly_amount,
        ];
    }

    public function getTaxStatusAttribute()
    {
        $latest = $this->taxRecords()->latest('id')->first();
        
        if (!$latest || empty($latest->valid_upto)) {
            // No tax data
            return 'DUE';
        }

        $validUpto = \Carbon\Carbon::parse($latest->valid_upto)->startOfDay();
        $now = \Carbon\Carbon::now()->startOfDay();

        if ($now->greaterThan($validUpto)) {
            return 'EXPIRED';
        } elseif ($now->copy()->addDays(30)->greaterThanOrEqualTo($validUpto)) {
            // Using 30 days as standard expiry-warning period
            return 'EXPIRING_SOON';
        } else {
            return 'ACTIVE';
        }
    }

    public function getFitnessAttribute()
    {
        $latest = $this->fitnessRecords()->latest('id')->first();
        if (!$latest) {
            return null;
        }

        return [
            'issue_date' => $latest->issue_date,
            'expiry_date' => $latest->expiry_date,
            'certificate_number' => $latest->certificate_number,
            'passed_by' => $latest->passed_by,
            'place' => $latest->place,
        ];
    }

    public function getFitnessStatusAttribute()
    {
        $latest = $this->fitnessRecords()->latest('id')->first();
        
        if (!$latest || empty($latest->expiry_date)) {
            return 'NOT_AVAILABLE';
        }

        $validUpto = \Carbon\Carbon::parse($latest->expiry_date)->startOfDay();
        $now = \Carbon\Carbon::now()->startOfDay();

        if ($now->greaterThan($validUpto)) {
            return 'EXPIRED';
        } elseif ($now->copy()->addDays(30)->greaterThanOrEqualTo($validUpto)) {
            return 'EXPIRING_SOON';
        } else {
            return 'ACTIVE';
        }
    }

    public function getPermitAttribute()
    {
        $latest = $this->permits()->latest('id')->first();
        if (!$latest) {
            return null;
        }

        return [
            'id' => $latest->id,
            'expiry_date' => $latest->expiry_date,
            'permit_number' => $latest->permit_number,
            'amount' => $latest->amount,
            'receipt_no' => $latest->receipt_no,
            'issue_date' => $latest->issue_date,
        ];
    }

    public function getPermitStatusAttribute()
    {
        $latest = $this->permits()->latest('id')->first();
        
        if (!$latest || empty($latest->expiry_date)) {
            return 'NOT_AVAILABLE';
        }

        $validUpto = \Carbon\Carbon::parse($latest->expiry_date)->startOfDay();
        $now = \Carbon\Carbon::now()->startOfDay();

        if ($now->greaterThan($validUpto)) {
            return 'EXPIRED';
        } elseif ($now->copy()->addDays(30)->greaterThanOrEqualTo($validUpto)) {
            return 'EXPIRING_SOON';
        } else {
            return 'ACTIVE';
        }
    }

    public function getNationalPermitAttribute()
    {
        $latest = $this->nationalPermits()->latest('id')->first();
        if (!$latest) {
            return null;
        }

        return [
            'id' => $latest->id,
            'expiry_date' => $latest->expiry_date,
            'state_info' => $latest->state_info,
            'address' => $latest->address,
            'city' => $latest->city,
        ];
    }

    public function getNationalPermitStatusAttribute()
    {
        $latest = $this->nationalPermits()->latest('id')->first();
        
        if (!$latest || empty($latest->expiry_date)) {
            return 'NOT_AVAILABLE';
        }

        $validUpto = \Carbon\Carbon::parse($latest->expiry_date)->startOfDay();
        $now = \Carbon\Carbon::now()->startOfDay();

        if ($now->greaterThan($validUpto)) {
            return 'EXPIRED';
        } elseif ($now->copy()->addDays(30)->greaterThanOrEqualTo($validUpto)) {
            return 'EXPIRING_SOON';
        } else {
            return 'ACTIVE';
        }
    }
}

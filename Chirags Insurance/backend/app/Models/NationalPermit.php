<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NationalPermit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id', 'permit_number', 'issue_date',
        'expiry_date', 'state_info', 'address', 'city',
        'created_by', 'updated_by'
    ];
    
    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}

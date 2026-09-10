<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id', 'permit_number', 'issue_date',
        'expiry_date', 'amount', 'receipt_no',
        'created_by', 'updated_by'
    ];
    
    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}

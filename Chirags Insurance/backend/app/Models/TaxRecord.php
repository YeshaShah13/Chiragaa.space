<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id', 'receipt_number', 'amount',
        'paid_date', 'valid_upto',
        'penalty', 'interest', 'yearly', 'yearly_amount', 'half_yearly', 'half_yearly_amount',
        'created_by', 'updated_by'
    ];
    
    protected $casts = [
        'paid_date' => 'date',
        'valid_upto' => 'date',
        'amount' => 'decimal:2',
        'penalty' => 'decimal:2',
        'interest' => 'decimal:2',
        'yearly_amount' => 'decimal:2',
        'half_yearly_amount' => 'decimal:2',
        'yearly' => 'boolean',
        'half_yearly' => 'boolean',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}

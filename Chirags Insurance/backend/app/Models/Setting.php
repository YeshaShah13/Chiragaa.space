<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'category',
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get the strongly typed value.
     */
    public function getTypedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $this->value;
            case 'json':
            case 'array':
                return json_decode($this->value, true);
            default:
                return $this->value;
        }
    }

    /**
     * Set the value, casting arrays/objects to JSON.
     */
    public function setTypedValueAttribute($value)
    {
        if (is_array($value) || is_object($value)) {
            $this->value = json_encode($value);
            $this->type = 'json';
        } elseif (is_bool($value)) {
            $this->value = $value ? '1' : '0';
            $this->type = 'boolean';
        } elseif (is_int($value)) {
            $this->value = (string) $value;
            $this->type = 'integer';
        } else {
            $this->value = (string) $value;
            $this->type = 'string';
        }
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('vehicle');

        return [
            // Master vehicle fields
            'vehicle_number' => 'nullable|string',
            'troli_no' => 'nullable|string',
            'owner_name' => 'nullable|string',
            'registration_date' => 'nullable|date',
            'tractor_registration_date' => 'nullable|date',
            'permanent_address' => 'nullable|string',
            'phone' => 'nullable|string',
            
            'make_id' => 'nullable',
            'class_id' => 'nullable',
            
            'model' => 'nullable|string',
            'horse_power' => 'nullable',
            'rlw' => 'nullable',
            'cylinder' => 'nullable',
            's_c_ind' => 'nullable',
            'uw' => 'nullable',
            
            'engine_number' => 'nullable|string',
            'chassis_number' => 'nullable|string',
            'plw' => 'nullable',
            'status' => 'nullable',
            
            'hpa_with' => 'nullable|string',
            'remarks' => 'nullable|string',
            'group' => 'nullable|string',

            // Compliance arrays - completely optional
            'tax' => 'nullable|array',
            'fitness' => 'nullable|array',
            'permit' => 'nullable|array',
            'national_permit' => 'nullable|array',
            'insurance' => 'nullable|array',
        ];
    }
}

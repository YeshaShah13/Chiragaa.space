<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInsurancePolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'insurance_company_id' => ['nullable'],
            'insurance_company_name' => ['nullable', 'string', 'max:255'],
            'policy_number' => ['required', 'string', 'max:255'],
            'receipt_number' => ['nullable', 'string', 'max:255'],
            
            'start_date' => ['nullable', 'date'],
            'expiry_date' => ['required', 'date'],
            'confirmation_number' => ['nullable', 'string', 'max:255'],
            'confirmation_date' => ['nullable', 'date'],
            'transfer_date' => ['nullable', 'date'],
            
            'group_name' => ['nullable', 'string', 'max:255'],
            'hpa_with' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            
            'sum_insured' => ['nullable', 'numeric', 'min:0'],
            'trolley_amount' => ['nullable', 'numeric', 'min:0'],
            'other_amount' => ['nullable', 'numeric', 'min:0'],
            'ncb' => ['nullable'],
            'od_tp_premium' => ['nullable', 'numeric', 'min:0'],
            'service_tax' => ['nullable', 'numeric', 'min:0'],
            
            'is_active' => ['boolean'],
        ];
    }
}

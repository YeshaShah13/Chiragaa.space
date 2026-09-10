<?php

namespace App\Http\Controllers;

use App\Models\InsurancePolicy;
use App\Http\Requests\StoreInsurancePolicyRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class InsurancePolicyController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = InsurancePolicy::with(['vehicle', 'insuranceCompany']);

        // Handle Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('policy_number', 'like', "%{$search}%")
                  ->orWhereHas('vehicle', function ($vq) use ($search) {
                      $vq->where('vehicle_number', 'like', "%{$search}%")
                         ->orWhere('owner_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('insuranceCompany', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Handle Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSortColumns = ['id', 'policy_number', 'start_date', 'expiry_date', 'premium_amount', 'is_active', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $policies = $query->paginate($request->input('per_page', 15))->withQueryString();

        return $this->success('Insurance policies retrieved successfully', $policies);
    }

    public function store(StoreInsurancePolicyRequest $request)
    {
        $data = $request->validated();
        
        $data['created_by'] = $request->user() ? $request->user()->id : null;
        $data['is_active'] = $data['is_active'] ?? true;
        
        $policy = InsurancePolicy::create($data);

        return $this->success('Insurance policy created successfully', $policy->load(['vehicle', 'insuranceCompany']), 201);
    }

    public function show($id)
    {
        $policy = InsurancePolicy::with(['vehicle', 'insuranceCompany'])->find($id);

        if (!$policy) {
            return $this->error('Insurance policy not found', [], 404);
        }

        return $this->success('Insurance policy retrieved successfully', $policy);
    }

    public function destroy(Request $request, $id)
    {
        $policy = InsurancePolicy::find($id);

        if (!$policy) {
            return $this->error('Insurance policy not found', [], 404);
        }

        $policy->delete();

        return $this->success('Insurance policy deleted successfully');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\InsurancePolicy;
use App\Models\Vehicle;
use App\Models\AuditLog;
use App\Services\InsurancePremiumService;
use App\Services\InsuranceStatusService;
use App\Http\Requests\StoreInsurancePolicyRequest;
use App\Http\Requests\UpdateInsurancePolicyRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InsuranceController extends Controller
{
    use ApiResponse;

    protected $premiumService;
    protected $statusService;

    public function __construct(InsurancePremiumService $premiumService, InsuranceStatusService $statusService)
    {
        $this->premiumService = $premiumService;
        $this->statusService = $statusService;
    }

    /**
     * GET /api/v1/insurance
     */
    public function index(Request $request)
    {
        $query = InsurancePolicy::with(['vehicle', 'insuranceCompany']);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('policy_number', 'like', "%{$search}%")
                  ->orWhereHas('vehicle', function ($vq) use ($search) {
                      $vq->where('vehicle_number', 'like', "%{$search}%")
                         ->orWhere('owner_name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('insuranceCompany', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtering
        if ($request->has('company')) {
            $query->where('insurance_company_id', $request->company);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSortColumns = ['id', 'policy_number', 'expiry_date', 'total_premium', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $perPage = min(1000, max(1, (int)$request->input('limit', $request->input('per_page', 15))));
        $policies = $query->paginate($perPage)->withQueryString();

        return $this->success('Insurance records retrieved successfully', $policies);
    }

    /**
     * GET /api/v1/insurance/{id}
     */
    public function show($id)
    {
        $policy = InsurancePolicy::with(['vehicle', 'insuranceCompany'])->find($id);

        if (!$policy) {
            return $this->error('Insurance not found', [], 404);
        }

        // Structure the response as requested
        $response = [
            'id' => $policy->id,
            'vehicle' => $policy->vehicle ? [
                'id' => $policy->vehicle->id,
                'vehicleNumber' => $policy->vehicle->vehicle_number,
                'ownerName' => $policy->vehicle->owner_name,
                'phone' => $policy->vehicle->phone,
                'city' => $policy->vehicle->permanent_address,
                'make' => $policy->vehicle->make ? $policy->vehicle->make->name : null,
                'model' => $policy->vehicle->model,
            ] : null,
            'policy' => [
                'insuranceCompany' => $policy->insuranceCompany ? $policy->insuranceCompany->name : null,
                'insuranceCompanyId' => $policy->insurance_company_id,
                'policyNumber' => $policy->policy_number,
                'receiptNumber' => $policy->receipt_number,
                'policyExpiryDate' => $policy->expiry_date ? Carbon::parse($policy->expiry_date)->format('Y-m-d') : null,
                'startDate' => $policy->start_date ? Carbon::parse($policy->start_date)->format('Y-m-d') : null,
                'confirmationNumber' => $policy->confirmation_number,
                'confirmationDate' => $policy->confirmation_date ? Carbon::parse($policy->confirmation_date)->format('Y-m-d') : null,
                'transferDate' => $policy->transfer_date ? Carbon::parse($policy->transfer_date)->format('Y-m-d') : null,
                'groupName' => $policy->group_name,
                'hpaWith' => $policy->hpa_with,
                'remarks' => $policy->remarks,
                'isActive' => $policy->is_active,
                'status' => $this->statusService->determineStatus($policy->expiry_date),
            ],
            'premium' => [
                'sumInsured' => (float) $policy->sum_insured,
                'trolleyAmount' => (float) $policy->trolley_amount,
                'otherAmount' => (float) $policy->other_amount,
                'ncb' => is_numeric($policy->ncb) ? (float) $policy->ncb : $policy->ncb,
                'odTpPremium' => (float) $policy->od_tp_premium,
                'serviceTax' => (float) $policy->service_tax,
                'totalPremium' => (float) $policy->total_premium,
            ],
            'audit' => [
                'createdAt' => $policy->created_at,
                'updatedAt' => $policy->updated_at,
            ]
        ];

        return $this->success('Insurance record retrieved successfully', $response);
    }

    /**
     * POST /api/v1/insurance
     */
    public function store(StoreInsurancePolicyRequest $request)
    {
        $data = $request->validated();
        $userId = $request->user() ? $request->user()->id : null;
        
        if (empty($data['insurance_company_id']) && !empty($request->input('insurance_company_name'))) {
            $comp = \App\Models\InsuranceCompany::firstOrCreate([
                'name' => trim($request->input('insurance_company_name'))
            ]);
            $data['insurance_company_id'] = $comp->id;
        }
        unset($data['insurance_company_name']);

        $data['created_by'] = $userId;
        $data['is_active'] = $data['is_active'] ?? true;
        
        // Calculate Premium on backend
        $data['total_premium'] = $this->premiumService->calculatePremium(
            $data['od_tp_premium'] ?? 0,
            $data['trolley_amount'] ?? 0,
            $data['other_amount'] ?? 0,
            $data['service_tax'] ?? 0,
            $data['ncb'] ?? 0
        );

        DB::beginTransaction();
        try {
            $policy = InsurancePolicy::create($data);

            // Create Audit Log
            \App\Services\AuditService::log(
                'CREATE',
                'Insurance',
                "Policy {$policy->policy_number}",
                'Insurance policy created',
                $policy->id,
                null,
                $policy->toArray()
            );

            DB::commit();
            return $this->success('Insurance policy created successfully', $policy->load(['vehicle', 'insuranceCompany']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create insurance policy', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/v1/insurance/{id}
     */
    public function update(UpdateInsurancePolicyRequest $request, $id)
    {
        $policy = InsurancePolicy::find($id);

        if (!$policy) {
            return $this->error('Insurance not found', [], 404);
        }

        $data = $request->validated();
        $userId = $request->user() ? $request->user()->id : null;
        $data['updated_by'] = $userId;

        if (empty($data['insurance_company_id']) && !empty($request->input('insurance_company_name'))) {
            $comp = \App\Models\InsuranceCompany::firstOrCreate([
                'name' => trim($request->input('insurance_company_name'))
            ]);
            $data['insurance_company_id'] = $comp->id;
        }
        unset($data['insurance_company_name']);
        
        $oldValues = $policy->toArray();

        // Recalculate Premium if related fields are provided
        $odTp = $data['od_tp_premium'] ?? $policy->od_tp_premium;
        $trolley = $data['trolley_amount'] ?? $policy->trolley_amount;
        $other = $data['other_amount'] ?? $policy->other_amount;
        $tax = $data['service_tax'] ?? $policy->service_tax;
        $ncb = $data['ncb'] ?? $policy->ncb;

        $data['total_premium'] = $this->premiumService->calculatePremium($odTp, $trolley, $other, $tax, $ncb);

        DB::beginTransaction();
        try {
            $policy->update($data);

            // Create Audit Log
            \App\Services\AuditService::log(
                'UPDATE',
                'Insurance',
                "Policy {$policy->policy_number}",
                'Insurance policy updated',
                $policy->id,
                $oldValues,
                $policy->fresh()->toArray()
            );

            DB::commit();
            return $this->success('Insurance policy updated successfully', $policy->load(['vehicle', 'insuranceCompany']));
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update insurance policy', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/v1/insurance/{id}
     */
    public function destroy(Request $request, $id)
    {
        $policy = InsurancePolicy::find($id);

        if (!$policy) {
            return $this->error('Insurance not found', [], 404);
        }

        $userId = $request->user() ? $request->user()->id : null;

        DB::beginTransaction();
        try {
            $policy->delete();

            // Create Audit Log
            \App\Services\AuditService::log(
                'DELETE',
                'Insurance',
                "Policy {$policy->policy_number}",
                'Insurance policy deleted',
                $policy->id,
                $policy->toArray()
            );

            DB::commit();
            return $this->success('Insurance policy deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to delete insurance policy', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/insurance/vehicle/{vehicleId}
     * Returns vehicle info + compliance details needed for Insurance Entry
     */
    public function getVehicleDetailsForInsurance($vehicleId)
    {
        $vehicle = Vehicle::with([
            'make', 'vehicleClass', 
            'taxRecords' => function($q) { $q->orderBy('valid_upto', 'desc')->limit(1); },
            'fitnessRecords' => function($q) { $q->orderBy('expiry_date', 'desc')->limit(1); },
            'permits' => function($q) { $q->orderBy('expiry_date', 'desc')->limit(1); },
            'nationalPermits' => function($q) { $q->orderBy('expiry_date', 'desc')->limit(1); }
        ])->find($vehicleId);

        if (!$vehicle) {
            return $this->error('Vehicle not found', [], 404);
        }

        // Compliance Helper
        $getCompliance = function($record, $dateField) {
            if (!$record) return ['expiryDate' => null, 'status' => 'MISSING'];
            $status = $this->statusService->determineStatus($record->$dateField);
            return [
                'expiryDate' => Carbon::parse($record->$dateField)->format('Y-m-d'),
                'status' => $status === 'ACTIVE' || $status === 'EXPIRING_SOON' ? 'VALID' : 'EXPIRED'
            ];
        };

        $response = [
            'vehicle' => [
                'id' => $vehicle->id,
                'vehicleNumber' => $vehicle->vehicle_number,
                'ownerName' => $vehicle->owner_name,
                'address' => $vehicle->permanent_address,
                'phone' => $vehicle->phone,
                'registrationDate' => $vehicle->registration_date ? Carbon::parse($vehicle->registration_date)->format('Y-m-d') : null,
                'model' => $vehicle->model,
                'make' => $vehicle->make ? $vehicle->make->name : null,
                'seatingCapacity' => $vehicle->s_c_ind,
                'horsePower' => $vehicle->horse_power,
                'rlw' => $vehicle->rlw,
                'engineNumber' => $vehicle->engine_number,
                'chassisNumber' => $vehicle->chassis_number,
            ],
            'compliance' => [
                'tax' => $getCompliance($vehicle->taxRecords->first(), 'valid_upto'),
                'fitness' => $getCompliance($vehicle->fitnessRecords->first(), 'expiry_date'),
                'permit' => $getCompliance($vehicle->permits->first(), 'expiry_date'),
                'nationalPermit' => $getCompliance($vehicle->nationalPermits->first(), 'expiry_date'),
            ]
        ];

        return $this->success('Vehicle insurance details retrieved', $response);
    }

    /**
     * GET /api/v1/vehicles/{vehicleId}/insurance
     */
    public function getPoliciesByVehicle($vehicleId)
    {
        $policies = InsurancePolicy::with('insuranceCompany')
            ->where('vehicle_id', $vehicleId)
            ->orderBy('expiry_date', 'desc')
            ->get();

        $formatted = $policies->map(function ($policy) {
            $status = $this->statusService->determineStatus($policy->expiry_date);
            return [
                'id' => $policy->id,
                'policyNumber' => $policy->policy_number,
                'company' => $policy->insuranceCompany ? $policy->insuranceCompany->name : null,
                'expiryDate' => $policy->expiry_date ? Carbon::parse($policy->expiry_date)->format('Y-m-d') : null,
                'totalPremium' => (float) $policy->total_premium,
                'status' => $status,
                'isActive' => $policy->is_active,
            ];
        });

        return $this->success('Vehicle policies retrieved', $formatted);
    }

    /**
     * GET /api/v1/insurance/expiring
     */
    public function getExpiring(Request $request)
    {
        $days = $request->input('days', 30);
        $threshold = Carbon::now()->addDays($days)->endOfDay();

        $policies = InsurancePolicy::with(['vehicle', 'insuranceCompany'])
            ->where('is_active', true)
            ->whereDate('expiry_date', '<=', $threshold)
            ->orderBy('expiry_date', 'asc')
            ->get();

        $formatted = $policies->map(function ($policy) {
            $status = $this->statusService->determineStatus($policy->expiry_date);
            return [
                'id' => $policy->id,
                'vehicleNumber' => $policy->vehicle->vehicle_number,
                'ownerName' => $policy->vehicle->owner_name,
                'phone' => $policy->vehicle->phone,
                'company' => $policy->insuranceCompany ? $policy->insuranceCompany->name : null,
                'policyNumber' => $policy->policy_number,
                'expiryDate' => $policy->expiry_date ? Carbon::parse($policy->expiry_date)->format('Y-m-d') : null,
                'daysRemaining' => $this->statusService->getDaysRemaining($policy->expiry_date),
                'status' => $status
            ];
        });

        return $this->success('Expiring policies retrieved', $formatted);
    }
}

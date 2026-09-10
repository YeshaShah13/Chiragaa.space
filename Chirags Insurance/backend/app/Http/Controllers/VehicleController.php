<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\AuditLog;
use App\Traits\ApiResponse;
use App\Services\VehicleService;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    use ApiResponse;

    protected VehicleService $vehicleService;

    public function __construct(VehicleService $vehicleService)
    {
        $this->vehicleService = $vehicleService;
    }

    public function index(Request $request)
    {
        $query = Vehicle::with(['make', 'vehicleClass']);

        // Handle Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('vehicle_number', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('chassis_number', 'like', "%{$search}%")
                  ->orWhere('engine_number', 'like', "%{$search}%");
            });
        }

        // Handle Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min(1000, max(1, (int)$request->input('limit', $request->input('per_page', 15))));
        $vehicles = $query->paginate($perPage)->withQueryString();

        return $this->success('Vehicles retrieved successfully', $vehicles);
    }

    public function store(StoreVehicleRequest $request)
    {
        $userId = $request->user() ? $request->user()->id : null;
        
        $vehicle = $this->vehicleService->createVehicleWithCompliance(
            $request->validated(), 
            $userId
        );

        return $this->success('Vehicle created successfully', $vehicle->load(['make', 'vehicleClass', 'insurancePolicies', 'taxRecords', 'fitnessRecords', 'permits', 'nationalPermits']), 201);
    }

    public function show($id)
    {
        $vehicle = Vehicle::with(['make', 'vehicleClass', 'insurancePolicies', 'taxRecords', 'fitnessRecords', 'permits', 'nationalPermits', 'documents'])->find($id);

        if (!$vehicle) {
            return $this->error('Vehicle not found', [], 404);
        }

        return $this->success('Vehicle retrieved successfully', $vehicle);
    }

    public function update(UpdateVehicleRequest $request, $id)
    {
        $vehicle = ($id instanceof Vehicle) ? $id : Vehicle::find($id);

        if (!$vehicle) {
            return $this->error('Vehicle not found', [], 404);
        }

        $userId = $request->user() ? $request->user()->id : null;

        $vehicle = $this->vehicleService->updateVehicleWithCompliance(
            $vehicle,
            $request->validated(),
            $userId
        );

        return $this->success('Vehicle updated successfully', $vehicle->load(['make', 'vehicleClass', 'insurancePolicies', 'taxRecords', 'fitnessRecords', 'permits', 'nationalPermits']));
    }

    public function destroy(Request $request, $id)
    {
        $vehicle = ($id instanceof Vehicle) ? $id : Vehicle::find($id);

        if (!$vehicle) {
            return $this->error('Vehicle not found', [], 404);
        }

        $oldValues = $vehicle->toArray();
        $vehicle->delete();

        \App\Services\AuditService::log(
            'DELETE',
            'Motor Management',
            "Vehicle {$vehicle->vehicle_number}",
            'Vehicle removed',
            $vehicle->id,
            $oldValues
        );

        return $this->success('Vehicle deleted successfully');
    }
}


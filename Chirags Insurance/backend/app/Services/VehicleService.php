<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VehicleService
{
    /**
     * Create a vehicle along with its initial compliance records in a transaction.
     */
    public function createVehicleWithCompliance(array $data, ?int $userId): Vehicle
    {
        return DB::transaction(function () use ($data, $userId) {
            // Extract master data (everything that is not an array for children)
            $masterData = collect($data)->except(['tax', 'fitness', 'permit', 'national_permit', 'insurance'])->toArray();
            if (empty($masterData['vehicle_number'])) {
                $masterData['vehicle_number'] = 'UNREG-' . strtoupper(substr(uniqid(), 0, 8));
            }
            $masterData['created_by'] = $userId;
            $masterData['updated_by'] = $userId;

            $vehicle = Vehicle::create($masterData);

            $this->logAudit($userId, $vehicle->id, 'Vehicle created', null, $vehicle->toArray());

            $this->processComplianceRecords($vehicle, $data, $userId, 'created');

            return $vehicle;
        });
    }

    /**
     * Update a vehicle and its compliance records.
     */
    public function updateVehicleWithCompliance(Vehicle $vehicle, array $data, ?int $userId): Vehicle
    {
        return DB::transaction(function () use ($vehicle, $data, $userId) {
            $masterData = collect($data)->except(['tax', 'fitness', 'permit', 'national_permit', 'insurance'])->toArray();
            $masterData['updated_by'] = $userId;

            $oldVehicleData = $vehicle->toArray();
            $vehicle->update($masterData);
            
            if ($vehicle->wasChanged()) {
                $this->logAudit($userId, $vehicle->id, 'Vehicle updated', $oldVehicleData, $vehicle->toArray());
            }

            $this->processComplianceRecords($vehicle, $data, $userId, 'updated');

            return $vehicle;
        });
    }

    /**
     * Handle the child compliance records logic.
     * We don't overwrite history. If there's new valid data provided for compliance, we just create a new record.
     */
    private function processComplianceRecords(Vehicle $vehicle, array $data, ?int $userId, string $actionType)
    {
        if (!empty($data['tax']) && (!empty($data['tax']['tax_up_to_date']) || !empty($data['tax']['tax_paid_date']) || !empty($data['tax']['amount']))) {
            $taxData = $data['tax'];
            $taxData['valid_upto'] = $taxData['tax_up_to_date'] ?? ($taxData['tax_paid_date'] ?? now()->toDateString());
            $taxData['paid_date'] = $taxData['tax_paid_date'] ?? null;
            $taxData['created_by'] = $userId;
            $taxData['updated_by'] = $userId;
            unset($taxData['tax_up_to_date'], $taxData['tax_paid_date']);

            $record = $vehicle->taxRecords()->create($taxData);
            $this->logAudit($userId, $vehicle->id, "Tax record $actionType", null, $record->toArray());
        }

        if (!empty($data['fitness']) && (!empty($data['fitness']['fitness_up_to_date']) || !empty($data['fitness']['passed_by']))) {
            $fitnessData = $data['fitness'];
            $fitnessData['expiry_date'] = $fitnessData['fitness_up_to_date'] ?? now()->toDateString();
            $fitnessData['created_by'] = $userId;
            $fitnessData['updated_by'] = $userId;
            unset($fitnessData['fitness_up_to_date']);

            $record = $vehicle->fitnessRecords()->create($fitnessData);
            $this->logAudit($userId, $vehicle->id, "Fitness record $actionType", null, $record->toArray());
        }

        if (!empty($data['permit']) && (!empty($data['permit']['permit_up_to_date']) || !empty($data['permit']['permit_no']))) {
            $permitData = $data['permit'];
            $permitData['expiry_date'] = $permitData['permit_up_to_date'] ?? now()->toDateString();
            $permitData['permit_number'] = $permitData['permit_no'] ?? 'N/A';
            $permitData['issue_date'] = $permitData['permit_date'] ?? null;
            $permitData['created_by'] = $userId;
            $permitData['updated_by'] = $userId;
            unset($permitData['permit_up_to_date'], $permitData['permit_no'], $permitData['permit_date']);

            $record = $vehicle->permits()->create($permitData);
            $this->logAudit($userId, $vehicle->id, "Permit record $actionType", null, $record->toArray());
        }

        if (!empty($data['national_permit']) && (!empty($data['national_permit']['national_permit_up_to_date']) || !empty($data['national_permit']['national_permit_state']))) {
            $npData = $data['national_permit'];
            $npData['expiry_date'] = $npData['national_permit_up_to_date'] ?? now()->toDateString();
            $npData['state_info'] = $npData['national_permit_state'] ?? null;
            $npData['address'] = $npData['postal_address'] ?? null;
            $npData['created_by'] = $userId;
            $npData['updated_by'] = $userId;
            unset($npData['national_permit_up_to_date'], $npData['national_permit_state'], $npData['postal_address']);

            $record = $vehicle->nationalPermits()->create($npData);
            $this->logAudit($userId, $vehicle->id, "National Permit record $actionType", null, $record->toArray());
        }

        if (!empty($data['insurance']) && (!empty($data['insurance']['policy_no']) || !empty($data['insurance']['insurance_expiry_date']))) {
            $insData = $data['insurance'];
            $insData['policy_number'] = $insData['policy_no'] ?? 'POL-' . strtoupper(substr(uniqid(), 0, 6));
            $insData['expiry_date'] = $insData['insurance_expiry_date'] ?? now()->addYear()->toDateString();
            $insData['start_date'] = $insData['start_date'] ?? now()->toDateString();
            $insData['created_by'] = $userId;
            $insData['updated_by'] = $userId;
            unset($insData['policy_no'], $insData['insurance_expiry_date']);

            $record = $vehicle->insurancePolicies()->create($insData);
            $this->logAudit($userId, $vehicle->id, "Insurance policy $actionType", null, $record->toArray());
        }
    }

    private function logAudit(?int $userId, int $vehicleId, string $action, ?array $oldValues = null, ?array $newValues = null)
    {
        $vehicle = Vehicle::find($vehicleId);
        $entityName = $vehicle ? "Vehicle {$vehicle->vehicle_number}" : "Vehicle ID {$vehicleId}";
        $actionWord = str_contains(strtolower($action), 'created') ? 'CREATE' : 'UPDATE';
        
        try {
            \App\Services\AuditService::log(
                $actionWord,
                'Motor Management',
                $entityName,
                $action, // e.g. "Vehicle created"
                $vehicleId,
                $oldValues,
                $newValues,
                'Success'
            );
        } catch (\Exception $e) {
            Log::error("Failed to write audit log: " . $e->getMessage());
        }
    }
}

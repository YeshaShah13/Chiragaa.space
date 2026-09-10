<?php

namespace App\Http\Controllers;

use App\Models\VehicleClass;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class VehicleClassController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success('Classes retrieved', VehicleClass::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:vehicle_classes,name']);
        $cls = VehicleClass::create($validated);
        return $this->success('Class created', $cls);
    }

    public function update(Request $request, VehicleClass $cls)
    {
        // the param is typically $vehicleClass but let's assume route model binding uses the variable name or the class name depending on how the route is set up.
        // In apiResource('vehicle-classes', VehicleClassController::class), the param is usually vehicle_class.
        // Let's bind it explicitly just in case, or use $id.
        $id = $cls->id;
        $validated = $request->validate(['name' => 'required|string|unique:vehicle_classes,name,' . $id]);
        $cls->update($validated);
        return $this->success('Class updated', $cls);
    }

    public function destroy(VehicleClass $cls)
    {
        $cls->delete();
        return $this->success('Class deleted');
    }
}

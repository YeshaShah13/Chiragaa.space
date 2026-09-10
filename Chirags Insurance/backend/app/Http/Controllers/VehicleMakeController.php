<?php

namespace App\Http\Controllers;

use App\Models\VehicleMake;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class VehicleMakeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success('Makes retrieved', VehicleMake::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:vehicle_makes,name']);
        $make = VehicleMake::create($validated);
        return $this->success('Make created', $make);
    }

    public function update(Request $request, VehicleMake $make)
    {
        $validated = $request->validate(['name' => 'required|string|unique:vehicle_makes,name,' . $make->id]);
        $make->update($validated);
        return $this->success('Make updated', $make);
    }

    public function destroy(VehicleMake $make)
    {
        $make->delete();
        return $this->success('Make deleted');
    }
}

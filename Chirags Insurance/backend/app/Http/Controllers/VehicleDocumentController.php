<?php

namespace App\Http\Controllers;

use App\Models\VehicleDocument;
use App\Models\Vehicle;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VehicleDocumentController extends Controller
{
    use ApiResponse;

    public function store(Request $request, $vehicleId)
    {
        $vehicle = Vehicle::find($vehicleId);

        if (!$vehicle) {
            return $this->error('Vehicle not found', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'document_type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', $validator->errors(), 422);
        }

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('vehicle_documents', $fileName, 'public');

        $document = VehicleDocument::create([
            'vehicle_id' => $vehicleId,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => '/storage/' . $filePath,
            'uploaded_by' => $request->user() ? $request->user()->id : null,
        ]);

        \App\Models\AuditLog::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'action' => 'uploaded_document',
            'module' => 'Vehicle',
            'record_id' => $vehicle->id,
            'new_values' => $document->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $this->success('Document uploaded successfully', $document, 201);
    }

    public function destroy(Request $request, $vehicleId, $documentId)
    {
        $document = VehicleDocument::where('vehicle_id', $vehicleId)->find($documentId);

        if (!$document) {
            return $this->error('Document not found', [], 404);
        }

        $oldValues = $document->toArray();
        $document->delete();

        \App\Models\AuditLog::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'action' => 'deleted_document',
            'module' => 'Vehicle',
            'record_id' => $vehicleId,
            'old_values' => $oldValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $this->success('Document deleted successfully');
    }
}

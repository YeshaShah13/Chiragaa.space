<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    /**
     * Log an audit event.
     *
     * @param string $action CREATE, UPDATE, DELETE, VIEW, etc.
     * @param string $module Motor Entry, Motor Management, Insurance, etc.
     * @param string|null $entityName e.g. "Vehicle MH01AB1234"
     * @param string|null $description e.g. "Vehicle created"
     * @param int|null $recordId Database ID of the record
     * @param array|null $oldValues Array of old values
     * @param array|null $newValues Array of new values
     * @param string $status Success or Failed
     * @return \App\Models\AuditLog
     */
    public static function log(
        string $action,
        string $module,
        ?string $entityName = null,
        ?string $description = null,
        ?int $recordId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        string $status = 'Success'
    ) {
        return AuditLog::create([
            'user_id' => Auth::id(), // Authenticated user
            'action' => $action,
            'module' => $module,
            'record_id' => $recordId,
            'entity_name' => $entityName,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => $status,
        ]);
    }
}

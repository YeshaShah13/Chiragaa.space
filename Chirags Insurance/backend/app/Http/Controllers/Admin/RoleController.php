<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all()->groupBy('module');

        return $this->success('Roles retrieved successfully', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    public function updatePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $oldPermissions = $role->permissions()->pluck('id')->toArray();
        $role->permissions()->sync($validated['permissions'] ?? []);

        AuditService::log(
            'UPDATE',
            'User Management',
            "Role: {$role->name}",
            'Role permissions updated',
            $role->id,
            ['permissions' => $oldPermissions],
            ['permissions' => $validated['permissions'] ?? []]
        );

        return $this->success('Role permissions updated successfully', $role->load('permissions'));
    }
}

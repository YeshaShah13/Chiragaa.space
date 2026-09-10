<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            'Dashboard' => ['view'],
            'Motor_Management' => ['view', 'create', 'edit', 'delete'],
            'Insurance' => ['view', 'create', 'edit', 'delete'],
            'Tax' => ['view', 'create', 'edit', 'delete'],
            'Fitness' => ['view', 'create', 'edit', 'delete'],
            'Permit' => ['view', 'create', 'edit', 'delete'],
            'National_Permit' => ['view', 'create', 'edit', 'delete'],
            'Reports' => ['view', 'export'],
            'Administration' => ['view', 'manage_users', 'manage_roles', 'view_audit']
        ];

        // Ensure roles exist
        $adminRole = Role::firstOrCreate(['id' => 1], [
            'name' => 'Administrator',
            'description' => 'Full system access'
        ]);

        $managerRole = Role::firstOrCreate(['name' => 'Manager'], [
            'description' => 'Can manage most records but not users or system settings'
        ]);

        $viewerRole = Role::firstOrCreate(['name' => 'Viewer'], [
            'description' => 'Can only view records'
        ]);

        // Create Permissions
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permissionName = strtolower($module) . '.' . $action;
                $permission = Permission::firstOrCreate([
                    'name' => $permissionName,
                    'module' => $module
                ], [
                    'description' => 'Can ' . str_replace('_', ' ', $action) . ' ' . str_replace('_', ' ', $module)
                ]);
            }
        }

        // Assign ALL permissions to Administrator
        $allPermissions = Permission::pluck('id')->toArray();
        $adminRole->permissions()->sync($allPermissions);

        // Update all existing users to have role_id = 1 if they don't already (to prevent lockout)
        User::whereNull('role_id')->orWhere('role_id', 0)->update(['role_id' => 1]);

        // Ensure at least one admin user exists
        if (User::count() === 0) {
            User::create([
                'name' => 'System Admin',
                'email' => 'admin@chirags.local',
                'password' => Hash::make('password123'),
                'role_id' => 1,
                'status' => 'Active'
            ]);
        }
    }
}

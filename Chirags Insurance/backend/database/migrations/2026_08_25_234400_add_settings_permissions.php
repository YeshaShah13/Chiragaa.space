<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $permissions = [
            ['name' => 'settings.view', 'description' => 'View Settings', 'module' => 'Settings', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'settings.edit', 'description' => 'Edit Settings', 'module' => 'Settings', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($permissions as $p) {
            $existing = DB::table('permissions')->where('name', $p['name'])->first();
            if (!$existing) {
                $id = DB::table('permissions')->insertGetId($p);
                // Assign to Admin role (role_id = 1)
                DB::table('role_permission')->insertOrIgnore([
                    'role_id' => 1,
                    'permission_id' => $id,
                ]);
            }
        }
    }

    public function down(): void
    {
        $ids = DB::table('permissions')->whereIn('name', ['settings.view', 'settings.edit'])->pluck('id');
        DB::table('role_permission')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();
    }
};

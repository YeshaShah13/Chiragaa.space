<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = User::with('role');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->paginate($request->input('limit', 15));

        return $this->success('Users retrieved successfully', $users);
    }

    public function show(User $user)
    {
        $user->load(['role', 'permissions']);
        return $this->success('User retrieved', $user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'status' => ['required', Rule::in(['Active', 'Inactive', 'Suspended'])],
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $validatedUser = $validated;
        unset($validatedUser['permissions']);
        $validatedUser['password'] = Hash::make($validatedUser['password']);

        $user = User::create($validatedUser);
        
        if (isset($validated['permissions'])) {
            $user->permissions()->sync($validated['permissions']);
        }

        $user->load(['role', 'permissions']);

        AuditService::log(
            'CREATE', 
            'User Management', 
            "User: {$user->name}", 
            'New user created',
            $user->id,
            null,
            $user->toArray()
        );

        return $this->success('User created successfully', $user, 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role_id' => 'required|exists:roles,id',
            'status' => ['required', Rule::in(['Active', 'Inactive', 'Suspended'])],
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Prevent deactivating the last administrator
        if ($user->role_id == 1 && $validated['role_id'] != 1 || $user->status == 'Active' && $validated['status'] != 'Active') {
            if ($user->role_id == 1) {
                $adminCount = User::where('role_id', 1)->where('status', 'Active')->count();
                if ($adminCount <= 1) {
                    return $this->error('Cannot modify the last active administrator', [], 400);
                }
            }
        }

        $oldValues = $user->toArray();
        $validatedUser = $validated;
        unset($validatedUser['permissions']);
        $user->update($validatedUser);
        
        if (isset($validated['permissions'])) {
            $user->permissions()->sync($validated['permissions']);
        }

        $user->load(['role', 'permissions']);

        $description = 'User updated';
        if ($oldValues['role_id'] != $user->role_id) {
            $description = "Role changed";
        } elseif ($oldValues['status'] != $user->status) {
            $description = "User account {$user->status}";
        }

        AuditService::log(
            'UPDATE', 
            'User Management', 
            "User: {$user->name}", 
            $description,
            $user->id,
            $oldValues,
            $user->toArray()
        );

        return $this->success('User updated successfully', $user);
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        AuditService::log(
            'PASSWORD_RESET', 
            'User Management', 
            "User: {$user->name}", 
            'Administrator reset user password',
            $user->id
        );

        return $this->success('Password reset successfully');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', $validator->errors(), 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            AuditLog::create([
                'action' => 'LOGIN_FAILED',
                'module' => 'Authentication',
                'description' => 'Failed login attempt: User not found',
                'old_values' => ['email' => $request->email],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'Failed'
            ]);
            return $this->error('User not found: ' . $request->email, [], 401);
        }

        if ($user->status !== 'Active') {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'LOGIN_FAILED',
                'module' => 'Authentication',
                'description' => 'Failed login attempt: User is ' . $user->status,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'Failed'
            ]);
            return $this->error('Account is ' . strtolower($user->status) . '. Please contact administrator.', [], 403);
        }

        $isValid = Hash::check($request->password, $user->password);
        
        if (!$isValid) {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'LOGIN_FAILED',
                'module' => 'Authentication',
                'description' => 'Failed login attempt: Invalid password',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'Failed'
            ]);
            return $this->error("Invalid credentials", [], 401);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

        $user->update(['last_login_at' => now(), 'last_active_at' => now()]);

        // We can't use AuditService::log directly here because Auth::id() is not yet populated
        // But since we have the $user object, we can create the log manually or login the user in Laravel session (if using web guard, but we use sanctum).
        // Since Sanctum uses tokens, we manually pass user_id to AuditLog here.
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'LOGIN_SUCCESS',
            'module' => 'Authentication',
            'description' => 'User logged in successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'Success'
        ]);

        // Eager load role and permissions for the frontend
        $user->load(['role.permissions', 'permissions']);

        return $this->success('Login successful', [
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        AuditService::log('LOGOUT', 'Authentication', null, 'User logged out successfully');

        $request->user()->currentAccessToken()->delete();

        return $this->success('Logged out successfully');
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->update(['last_active_at' => now()]);
        $user->load(['role.permissions', 'permissions']);
        
        return $this->success('User retrieved', [
            'user' => $user
        ]);
    }
}

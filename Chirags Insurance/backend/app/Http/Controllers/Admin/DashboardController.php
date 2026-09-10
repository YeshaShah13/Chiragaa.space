<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use ApiResponse;

    public function stats()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'Active')->count();
        $inactiveUsers = User::where('status', '!=', 'Active')->count();
        
        $recentActivityCount = AuditLog::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        $recentActivity = AuditLog::with('user:id,name')->orderBy('created_at', 'desc')->take(10)->get();

        return $this->success('Admin stats retrieved', [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'recent_activity_count' => $recentActivityCount,
            'recent_activity' => $recentActivity
        ]);
    }
}

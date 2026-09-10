<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Get real-time overview analytics for the main dashboard.
     */
    public function overview(Request $request)
    {
        $today = now()->toDateString();
        $in30Days = now()->addDays(30)->toDateString();

        // 1. Total Fleet Counts
        $totalVehicles = DB::table('vehicles')->whereNull('deleted_at')->count();
        $activeVehicles = DB::table('vehicles')->whereNull('deleted_at')->where(function ($q) {
            $q->where('status', 'Active')->orWhereNull('status');
        })->count();

        // Distinct vehicles with at least one expired compliance item (guaranteed <= totalVehicles)
        $distinctExpiredVehicles = DB::table(function ($query) use ($today) {
            $query->from('tax_records')->select('vehicle_id')->whereNull('deleted_at')->where('valid_upto', '<', $today)
                ->union(DB::table('fitness_records')->select('vehicle_id')->whereNull('deleted_at')->where('expiry_date', '<', $today))
                ->union(DB::table('permits')->select('vehicle_id')->whereNull('deleted_at')->where('expiry_date', '<', $today))
                ->union(DB::table('insurance_policies')->select('vehicle_id')->whereNull('deleted_at')->where('expiry_date', '<', $today))
                ->union(DB::table('national_permits')->select('vehicle_id')->whereNull('deleted_at')->where('expiry_date', '<', $today));
        }, 'expired_v')->count();

        // Distinct vehicles with at least one document expiring in next 30 days
        $distinctExpiringSoonVehicles = DB::table(function ($query) use ($today, $in30Days) {
            $query->from('tax_records')->select('vehicle_id')->whereNull('deleted_at')->whereBetween('valid_upto', [$today, $in30Days])
                ->union(DB::table('fitness_records')->select('vehicle_id')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days]))
                ->union(DB::table('permits')->select('vehicle_id')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days]))
                ->union(DB::table('insurance_policies')->select('vehicle_id')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days]))
                ->union(DB::table('national_permits')->select('vehicle_id')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days]));
        }, 'expiring_v')->count();

        // 2. Compliance Metrics (per individual module)
        // Tax
        $taxValid = DB::table('tax_records')->whereNull('deleted_at')->where('valid_upto', '>', $in30Days)->distinct('vehicle_id')->count('vehicle_id');
        $taxExpiring = DB::table('tax_records')->whereNull('deleted_at')->whereBetween('valid_upto', [$today, $in30Days])->distinct('vehicle_id')->count('vehicle_id');
        $taxExpired = DB::table('tax_records')->whereNull('deleted_at')->where('valid_upto', '<', $today)->distinct('vehicle_id')->count('vehicle_id');

        // Fitness
        $fitValid = DB::table('fitness_records')->whereNull('deleted_at')->where('expiry_date', '>', $in30Days)->distinct('vehicle_id')->count('vehicle_id');
        $fitExpiring = DB::table('fitness_records')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days])->distinct('vehicle_id')->count('vehicle_id');
        $fitExpired = DB::table('fitness_records')->whereNull('deleted_at')->where('expiry_date', '<', $today)->distinct('vehicle_id')->count('vehicle_id');

        // Permit
        $perValid = DB::table('permits')->whereNull('deleted_at')->where('expiry_date', '>', $in30Days)->distinct('vehicle_id')->count('vehicle_id');
        $perExpiring = DB::table('permits')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days])->distinct('vehicle_id')->count('vehicle_id');
        $perExpired = DB::table('permits')->whereNull('deleted_at')->where('expiry_date', '<', $today)->distinct('vehicle_id')->count('vehicle_id');

        // Insurance
        $insValid = DB::table('insurance_policies')->whereNull('deleted_at')->where('expiry_date', '>', $in30Days)->distinct('vehicle_id')->count('vehicle_id');
        $insExpiring = DB::table('insurance_policies')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days])->distinct('vehicle_id')->count('vehicle_id');
        $insExpired = DB::table('insurance_policies')->whereNull('deleted_at')->where('expiry_date', '<', $today)->distinct('vehicle_id')->count('vehicle_id');
        $insDue = DB::table('insurance_policies')->whereNull('deleted_at')->where('expiry_date', '<=', $in30Days)->distinct('vehicle_id')->count('vehicle_id');

        // National Permit
        $npValid = DB::table('national_permits')->whereNull('deleted_at')->where('expiry_date', '>', $in30Days)->distinct('vehicle_id')->count('vehicle_id');
        $npExpiring = DB::table('national_permits')->whereNull('deleted_at')->whereBetween('expiry_date', [$today, $in30Days])->distinct('vehicle_id')->count('vehicle_id');
        $npExpired = DB::table('national_permits')->whereNull('deleted_at')->where('expiry_date', '<', $today)->distinct('vehicle_id')->count('vehicle_id');

        $totalExpiringSoon = $distinctExpiringSoonVehicles;
        $totalExpired = $distinctExpiredVehicles;

        // 3. Vehicle Overview Data (Distribution by vehicle class or status)
        $topClasses = DB::table('vehicles')
            ->leftJoin('vehicle_classes', 'vehicles.class_id', '=', 'vehicle_classes.id')
            ->whereNull('vehicles.deleted_at')
            ->select(
                DB::raw('COALESCE(vehicle_classes.name, "General Fleet") as name'),
                DB::raw('COUNT(*) as value')
            )
            ->groupBy('name')
            ->orderBy('value', 'desc')
            ->limit(4)
            ->get();

        $colors = ['#111111', '#4F46E5', '#059669', '#D97706', '#64748B'];
        $vehicleOverviewItems = [];
        foreach ($topClasses as $idx => $item) {
            $vehicleOverviewItems[] = [
                'name' => $item->name,
                'value' => (int) $item->value,
                'color' => $colors[$idx % count($colors)],
            ];
        }

        // 4. Compliance Overview Bars
        $complianceData = [
            [
                'name' => 'Tax',
                'total' => $totalVehicles,
                'valid' => $taxValid,
                'expiring' => $taxExpiring,
                'expired' => $taxExpired,
            ],
            [
                'name' => 'Fitness',
                'total' => $totalVehicles,
                'valid' => $fitValid,
                'expiring' => $fitExpiring,
                'expired' => $fitExpired,
            ],
            [
                'name' => 'Permit',
                'total' => $totalVehicles,
                'valid' => $perValid,
                'expiring' => $perExpiring,
                'expired' => $perExpired,
            ],
            [
                'name' => 'Insurance',
                'total' => $totalVehicles,
                'valid' => $insValid,
                'expiring' => $insExpiring,
                'expired' => $insExpired,
            ],
            [
                'name' => 'National Permit',
                'total' => $totalVehicles,
                'valid' => $npValid,
                'expiring' => $npExpiring,
                'expired' => $npExpired,
            ],
        ];

        // 5. Recent Vehicle Activity from Audit Logs (Top 6 entries)
        $recentAuditLogs = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->select('audit_logs.*', 'users.name as user_name')
            ->orderBy('audit_logs.created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($log) {
                $statusBadge = 'Updated';
                if (str_contains(strtoupper($log->action), 'CREATE')) {
                    $statusBadge = 'Active';
                } elseif (str_contains(strtoupper($log->action), 'DELETE')) {
                    $statusBadge = 'Expired';
                }

                $createdAt = Carbon::parse($log->created_at);
                $dateFormatted = $createdAt->isToday()
                    ? 'Today, ' . $createdAt->format('h:i A')
                    : ($createdAt->isYesterday()
                        ? 'Yesterday, ' . $createdAt->format('h:i A')
                        : $createdAt->format('M d, h:i A'));

                return [
                    'id' => $log->id,
                    'vehicle' => $log->entity_name ?: 'Vehicle',
                    'owner' => $log->module,
                    'activity' => $log->description ?: $log->action,
                    'by' => $log->user_name ?: 'System',
                    'date' => $dateFormatted,
                    'status' => $statusBadge,
                ];
            });

        // 6. Real Upcoming Expiries (Top 6 nearest expiring records across all modules)
        $insExpiries = DB::table('insurance_policies')
            ->join('vehicles', 'insurance_policies.vehicle_id', '=', 'vehicles.id')
            ->whereNull('insurance_policies.deleted_at')
            ->whereBetween('insurance_policies.expiry_date', [$today, $in30Days])
            ->select(
                'vehicles.id as vehicle_id',
                'vehicles.vehicle_number',
                'vehicles.owner_name',
                DB::raw("'Insurance' as type"),
                'insurance_policies.expiry_date'
            )
            ->orderBy('insurance_policies.expiry_date', 'asc')
            ->limit(6)
            ->get();

        $taxExpiries = DB::table('tax_records')
            ->join('vehicles', 'tax_records.vehicle_id', '=', 'vehicles.id')
            ->whereNull('tax_records.deleted_at')
            ->whereBetween('tax_records.valid_upto', [$today, $in30Days])
            ->select(
                'vehicles.id as vehicle_id',
                'vehicles.vehicle_number',
                'vehicles.owner_name',
                DB::raw("'Tax' as type"),
                'tax_records.valid_upto as expiry_date'
            )
            ->orderBy('tax_records.valid_upto', 'asc')
            ->limit(6)
            ->get();

        $fitExpiries = DB::table('fitness_records')
            ->join('vehicles', 'fitness_records.vehicle_id', '=', 'vehicles.id')
            ->whereNull('fitness_records.deleted_at')
            ->whereBetween('fitness_records.expiry_date', [$today, $in30Days])
            ->select(
                'vehicles.id as vehicle_id',
                'vehicles.vehicle_number',
                'vehicles.owner_name',
                DB::raw("'Fitness' as type"),
                'fitness_records.expiry_date'
            )
            ->orderBy('fitness_records.expiry_date', 'asc')
            ->limit(6)
            ->get();

        $perExpiries = DB::table('permits')
            ->join('vehicles', 'permits.vehicle_id', '=', 'vehicles.id')
            ->whereNull('permits.deleted_at')
            ->whereBetween('permits.expiry_date', [$today, $in30Days])
            ->select(
                'vehicles.id as vehicle_id',
                'vehicles.vehicle_number',
                'vehicles.owner_name',
                DB::raw("'Permit' as type"),
                'permits.expiry_date'
            )
            ->orderBy('permits.expiry_date', 'asc')
            ->limit(6)
            ->get();

        $npExpiries = DB::table('national_permits')
            ->join('vehicles', 'national_permits.vehicle_id', '=', 'vehicles.id')
            ->whereNull('national_permits.deleted_at')
            ->whereBetween('national_permits.expiry_date', [$today, $in30Days])
            ->select(
                'vehicles.id as vehicle_id',
                'vehicles.vehicle_number',
                'vehicles.owner_name',
                DB::raw("'National Permit' as type"),
                'national_permits.expiry_date'
            )
            ->orderBy('national_permits.expiry_date', 'asc')
            ->limit(6)
            ->get();

        $upcomingExpiries = collect([...$insExpiries, ...$taxExpiries, ...$fitExpiries, ...$perExpiries, ...$npExpiries])
            ->sortBy('expiry_date')
            ->values()
            ->take(6)
            ->map(function ($item) use ($today) {
                $expiry = Carbon::parse($item->expiry_date);
                $days = Carbon::parse($today)->diffInDays($expiry, false);
                return [
                    'vehicle_id' => $item->vehicle_id,
                    'vehicle' => $item->vehicle_number,
                    'owner' => $item->owner_name ?: 'Unknown Owner',
                    'type' => $item->type,
                    'date' => $expiry->format('M d, Y'),
                    'days' => max(0, $days),
                    'urgent' => $days <= 7,
                ];
            });

        return $this->success('Dashboard analytics retrieved successfully', [
            'kpis' => [
                'total_vehicles' => $totalVehicles,
                'active_vehicles' => $activeVehicles,
                'expiring_soon' => $totalExpiringSoon,
                'expired' => $totalExpired,
                'insurance_due' => $insDue,
            ],
            'vehicle_overview' => [
                'total' => $totalVehicles,
                'items' => $vehicleOverviewItems,
            ],
            'compliance_overview' => $complianceData,
            'recent_activity' => $recentAuditLogs,
            'upcoming_expiries' => $upcomingExpiries,
        ]);
    }
}

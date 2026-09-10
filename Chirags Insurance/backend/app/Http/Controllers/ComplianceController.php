<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComplianceController extends Controller
{
    use ApiResponse;

    /**
     * Get system-wide compliance statistics for all modules.
     */
    public function stats(Request $request)
    {
        $totalVehicles = DB::table('vehicles')->whereNull('deleted_at')->count();
        $today = now()->toDateString();
        $in30Days = now()->addDays(30)->toDateString();

        // Tax Statistics
        $taxTotalAmount = (float) DB::table('tax_records')
            ->whereNull('deleted_at')
            ->sum(DB::raw('COALESCE(amount, 0) + COALESCE(penalty, 0) + COALESCE(interest, 0)'));
        $taxActive = DB::table('tax_records')
            ->whereNull('deleted_at')
            ->where('valid_upto', '>', $in30Days)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $taxExpiringSoon = DB::table('tax_records')
            ->whereNull('deleted_at')
            ->whereBetween('valid_upto', [$today, $in30Days])
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $taxExpired = DB::table('tax_records')
            ->whereNull('deleted_at')
            ->where('valid_upto', '<', $today)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $taxDue = max(0, $totalVehicles - ($taxActive + $taxExpiringSoon + $taxExpired));

        // Fitness Statistics
        $fitActive = DB::table('fitness_records')
            ->whereNull('deleted_at')
            ->where('expiry_date', '>', $in30Days)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $fitExpiringSoon = DB::table('fitness_records')
            ->whereNull('deleted_at')
            ->whereBetween('expiry_date', [$today, $in30Days])
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $fitExpired = DB::table('fitness_records')
            ->whereNull('deleted_at')
            ->where('expiry_date', '<', $today)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $fitNotAvailable = max(0, $totalVehicles - ($fitActive + $fitExpiringSoon + $fitExpired));

        // Permit Statistics
        $perTotalAmount = (float) DB::table('permits')
            ->whereNull('deleted_at')
            ->sum(DB::raw('COALESCE(amount, 0)'));
        $perActive = DB::table('permits')
            ->whereNull('deleted_at')
            ->where('expiry_date', '>', $in30Days)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $perExpiringSoon = DB::table('permits')
            ->whereNull('deleted_at')
            ->whereBetween('expiry_date', [$today, $in30Days])
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $perExpired = DB::table('permits')
            ->whereNull('deleted_at')
            ->where('expiry_date', '<', $today)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $perNotAvailable = max(0, $totalVehicles - ($perActive + $perExpiringSoon + $perExpired));

        // National Permit Statistics
        $npActive = DB::table('national_permits')
            ->whereNull('deleted_at')
            ->where('expiry_date', '>', $in30Days)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $npExpiringSoon = DB::table('national_permits')
            ->whereNull('deleted_at')
            ->whereBetween('expiry_date', [$today, $in30Days])
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $npExpired = DB::table('national_permits')
            ->whereNull('deleted_at')
            ->where('expiry_date', '<', $today)
            ->distinct('vehicle_id')
            ->count('vehicle_id');
        $npNotAvailable = max(0, $totalVehicles - ($npActive + $npExpiringSoon + $npExpired));

        return $this->success('Compliance statistics retrieved successfully', [
            'total_vehicles' => $totalVehicles,
            'tax' => [
                'total' => $totalVehicles,
                'active' => $taxActive,
                'expiring_soon' => $taxExpiringSoon,
                'expired' => $taxExpired,
                'due' => $taxDue,
                'total_amount' => $taxTotalAmount,
            ],
            'fitness' => [
                'total' => $totalVehicles,
                'active' => $fitActive,
                'expiring_soon' => $fitExpiringSoon,
                'expired' => $fitExpired,
                'not_available' => $fitNotAvailable,
            ],
            'permit' => [
                'total' => $totalVehicles,
                'active' => $perActive,
                'expiring_soon' => $perExpiringSoon,
                'expired' => $perExpired,
                'not_available' => $perNotAvailable,
                'total_amount' => $perTotalAmount,
            ],
            'national_permit' => [
                'total' => $totalVehicles,
                'active' => $npActive,
                'expiring_soon' => $npExpiringSoon,
                'expired' => $npExpired,
                'not_available' => $npNotAvailable,
            ],
        ]);
    }
}

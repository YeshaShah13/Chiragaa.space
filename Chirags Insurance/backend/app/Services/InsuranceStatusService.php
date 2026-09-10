<?php

namespace App\Services;

use Carbon\Carbon;

class InsuranceStatusService
{
    /**
     * Determine the status of an insurance policy based on its expiry date.
     *
     * @param string|Carbon $expiryDate
     * @param int $warningDays Threshold for "EXPIRING_SOON"
     * @return string 'ACTIVE', 'EXPIRING_SOON', or 'EXPIRED'
     */
    public function determineStatus($expiryDate, int $warningDays = 30): string
    {
        if (!$expiryDate) {
            return 'EXPIRED'; // Or another default if no date is set
        }

        $expiry = Carbon::parse($expiryDate)->startOfDay();
        $today = Carbon::now()->startOfDay();

        if ($expiry->isBefore($today)) {
            return 'EXPIRED';
        }

        $daysRemaining = $today->diffInDays($expiry, false);

        if ($daysRemaining <= $warningDays) {
            return 'EXPIRING_SOON';
        }

        return 'ACTIVE';
    }

    /**
     * Get days remaining for a policy.
     */
    public function getDaysRemaining($expiryDate): int
    {
        if (!$expiryDate) {
            return 0;
        }

        $expiry = Carbon::parse($expiryDate)->startOfDay();
        $today = Carbon::now()->startOfDay();

        return (int) $today->diffInDays($expiry, false);
    }
}

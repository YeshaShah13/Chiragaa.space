<?php

namespace App\Services;

class InsurancePremiumService
{
    /**
     * Calculate the total premium based on business rules.
     * Total Premium = OD & TP Premium + Trolley Amount + Other Amount + Service Tax - NCB
     *
     * @param float $odTpPremium
     * @param float $trolleyAmount
     * @param float $otherAmount
     * @param float $serviceTax
     * @param float $ncb
     * @return float
     */
    public function calculatePremium($odTpPremium = 0, $trolleyAmount = 0, $otherAmount = 0, $serviceTax = 0, $ncb = 0): float
    {
        $odTpPremium = (float) $odTpPremium;
        $trolleyAmount = (float) $trolleyAmount;
        $otherAmount = (float) $otherAmount;
        $serviceTax = (float) $serviceTax;
        $ncb = (float) $ncb;

        $total = ($odTpPremium + $trolleyAmount + $otherAmount + $serviceTax) - $ncb;

        // Ensure we don't return negative total premium unless explicitly requested by business logic.
        return $total > 0 ? $total : 0;
    }
}

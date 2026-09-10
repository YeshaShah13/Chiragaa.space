<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['category' => 'General', 'key' => 'company_name', 'value' => 'Chirags Insurance', 'type' => 'string', 'description' => 'Official Company Name'],
            ['category' => 'General', 'key' => 'app_name', 'value' => 'Chirag Auto Adviser', 'type' => 'string', 'description' => 'Application Name'],
            ['category' => 'General', 'key' => 'address', 'value' => '123 Main Street', 'type' => 'string', 'description' => 'Company Address'],
            ['category' => 'General', 'key' => 'phone', 'value' => '+91 98765 43210', 'type' => 'string', 'description' => 'Contact Phone'],
            ['category' => 'General', 'key' => 'email', 'value' => 'info@chirags.com', 'type' => 'string', 'description' => 'Contact Email'],
            ['category' => 'General', 'key' => 'website', 'value' => 'https://chirags.com', 'type' => 'string', 'description' => 'Website URL'],
            ['category' => 'General', 'key' => 'default_rto_office', 'value' => 'GJ03', 'type' => 'string', 'description' => 'Default RTO Office Code'],
            ['category' => 'General', 'key' => 'default_date_format', 'value' => 'DD/MM/YYYY', 'type' => 'string', 'description' => 'Global Date Format'],
            ['category' => 'General', 'key' => 'default_currency', 'value' => 'INR', 'type' => 'string', 'description' => 'Global Currency'],
            ['category' => 'General', 'key' => 'timezone', 'value' => 'Asia/Kolkata', 'type' => 'string', 'description' => 'System Timezone'],

            // Tax & Compliance
            ['category' => 'Tax & Compliance', 'key' => 'tax_expiry_warning_period', 'value' => '30', 'type' => 'integer', 'description' => 'Days before tax expiry to trigger warning'],
            ['category' => 'Tax & Compliance', 'key' => 'default_tax_frequency', 'value' => 'Yearly', 'type' => 'string', 'description' => 'Default Frequency (Yearly/Half Yearly)'],
            ['category' => 'Tax & Compliance', 'key' => 'default_payment_mode', 'value' => 'Online', 'type' => 'string', 'description' => 'Default Payment Mode'],
            ['category' => 'Tax & Compliance', 'key' => 'penalty_calculation', 'value' => 'fixed', 'type' => 'string', 'description' => 'Penalty Calculation Mode'],

            // Vehicle
            ['category' => 'Vehicle', 'key' => 'vehicle_number_format', 'value' => 'XX00XX0000', 'type' => 'string', 'description' => 'Format mask for vehicle number'],
            ['category' => 'Vehicle', 'key' => 'default_vehicle_type', 'value' => 'Commercial', 'type' => 'string', 'description' => 'Default Type'],
            ['category' => 'Vehicle', 'key' => 'default_fuel_type', 'value' => 'Diesel', 'type' => 'string', 'description' => 'Default Fuel'],
            
            // Insurance
            ['category' => 'Insurance', 'key' => 'insurance_expiry_warning_period', 'value' => '30', 'type' => 'integer', 'description' => 'Days before insurance expiry to warn'],
            ['category' => 'Insurance', 'key' => 'default_policy_type', 'value' => 'Comprehensive', 'type' => 'string', 'description' => 'Default Policy Type'],

            // RTO / Office
            ['category' => 'RTO / Office', 'key' => 'rto_code', 'value' => 'GJ03', 'type' => 'string', 'description' => 'RTO Code for documents'],
            ['category' => 'RTO / Office', 'key' => 'rto_name', 'value' => 'Rajkot RTO', 'type' => 'string', 'description' => 'RTO Office Name'],
            ['category' => 'RTO / Office', 'key' => 'rto_location', 'value' => 'Rajkot, Gujarat', 'type' => 'string', 'description' => 'RTO Location'],
            ['category' => 'RTO / Office', 'key' => 'regional_transport_authority', 'value' => 'Regional Transport Authority Rajkot', 'type' => 'string', 'description' => 'RTA Name'],

            // Documents & Reports
            ['category' => 'Documents & Reports', 'key' => 'default_paper_size', 'value' => 'A4', 'type' => 'string', 'description' => 'Print Paper Size'],
            ['category' => 'Documents & Reports', 'key' => 'pdf_filename_format', 'value' => '{vehicle_number}_{document_type}_{date}.pdf', 'type' => 'string', 'description' => 'PDF Name Template'],
            ['category' => 'Documents & Reports', 'key' => 'show_logo_on_reports', 'value' => true, 'type' => 'boolean', 'description' => 'Show Logo on prints'],

            // Notifications
            ['category' => 'Notifications', 'key' => 'notify_tax_expiry', 'value' => true, 'type' => 'boolean', 'description' => 'Notify on tax expiry'],
            ['category' => 'Notifications', 'key' => 'notify_insurance_expiry', 'value' => true, 'type' => 'boolean', 'description' => 'Notify on insurance expiry'],
            
            // Appearance
            ['category' => 'Appearance', 'key' => 'theme', 'value' => 'light', 'type' => 'string', 'description' => 'Default Theme'],

            // Security
            ['category' => 'Security', 'key' => 'session_timeout', 'value' => '120', 'type' => 'integer', 'description' => 'Session Timeout in Minutes'],
            ['category' => 'Security', 'key' => 'password_policy', 'value' => 'strict', 'type' => 'string', 'description' => 'Password Policy Level'],
            
            // Data & Backup
            ['category' => 'Data & Backup', 'key' => 'auto_backup_enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Enable Auto Backup'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}

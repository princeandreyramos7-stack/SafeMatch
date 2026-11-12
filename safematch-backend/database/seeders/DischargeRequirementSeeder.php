<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DischargeRequirement;

class DischargeRequirementSeeder extends Seeder
{
    public function run(): void
    {
        $requirements = [
            // Mother requirements
            [
                'name' => 'Vital Signs Stable',
                'description' => 'Blood pressure, temperature, and pulse within normal range for 24 hours',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Postpartum Bleeding Controlled',
                'description' => 'Lochia flow is moderate and within expected range',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Pain Managed',
                'description' => 'Pain controlled with oral medications, pain scale ≤3',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Able to Ambulate',
                'description' => 'Mother can walk independently or with minimal assistance',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Voiding Normally',
                'description' => 'Mother able to urinate without difficulty',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Discharge Instructions Received',
                'description' => 'Mother verbalized understanding of home care and warning signs',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Follow-up Appointment Scheduled',
                'description' => 'Postpartum follow-up appointment scheduled within 2 weeks',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Breastfeeding Established',
                'description' => 'Successful breastfeeding demonstrated or feeding plan in place',
                'requirement_type' => 'maternal',
                'is_required' => false,
                'is_active' => true,
            ],
            
            // Newborn requirements
            [
                'name' => 'Newborn Screening Complete',
                'description' => 'All mandatory newborn screenings performed and documented',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Vital Signs Stable',
                'description' => 'Newborn temperature, heart rate, respiratory rate stable for 24 hours',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Feeding Well',
                'description' => 'Newborn feeding every 2-3 hours and tolerating feeds',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Voiding and Stooling',
                'description' => 'At least 6 wet diapers and regular bowel movements',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Weight Loss Within Limits',
                'description' => 'Weight loss <10% of birth weight or weight stabilized',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Jaundice Assessed',
                'description' => 'Bilirubin levels checked if indicated, within safe range',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Immunizations Administered',
                'description' => 'BCG and Hepatitis B vaccines given as per schedule',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Car Seat Safety Demonstrated',
                'description' => 'Parents demonstrated proper car seat installation and use',
                'requirement_type' => 'newborn',
                'is_required' => false,
                'is_active' => true,
            ],
            
            // Both mother and newborn
            [
                'name' => 'Birth Certificate Application',
                'description' => 'Birth registration documents completed',
                'requirement_type' => 'maternal',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Pediatrician Appointment',
                'description' => 'First pediatric visit scheduled within 3-5 days',
                'requirement_type' => 'newborn',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Hospital Bill Settled',
                'description' => 'Payment arranged or financial clearance obtained',
                'requirement_type' => 'maternal',
                'is_required' => false,
                'is_active' => true,
            ],
        ];

        foreach ($requirements as $requirement) {
            DischargeRequirement::firstOrCreate(
                ['name' => $requirement['name'], 'requirement_type' => $requirement['requirement_type']],
                $requirement
            );
        }

        $this->command->info('✓ Discharge requirements seeded (20 requirements)');
    }
}

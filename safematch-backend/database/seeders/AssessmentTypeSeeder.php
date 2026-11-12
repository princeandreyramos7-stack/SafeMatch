<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MaternalAssessmentType;

class AssessmentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $assessmentTypes = [
            [
                'name' => 'Vital Signs',
                'description' => 'Blood pressure, temperature, pulse, and respiratory rate monitoring',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Postpartum Bleeding Assessment',
                'description' => 'Monitor lochia flow and check for excessive bleeding',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Pain Assessment',
                'description' => 'Evaluate pain levels and comfort measures',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Uterine Fundal Assessment',
                'description' => 'Check uterine position, tone, and involution',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Perineal Assessment',
                'description' => 'Evaluate perineum for tears, swelling, or infection',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Breastfeeding Assessment',
                'description' => 'Evaluate latch, milk production, and breastfeeding technique',
                'is_required' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Emotional Wellbeing Assessment',
                'description' => 'Screen for postpartum depression and anxiety',
                'is_required' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Incision Site Assessment (C-Section)',
                'description' => 'Monitor surgical incision for signs of infection or complications',
                'is_required' => false,
                'is_active' => true,
            ],
        ];

        foreach ($assessmentTypes as $type) {
            MaternalAssessmentType::firstOrCreate(
                ['name' => $type['name']],
                $type
            );
        }

        $this->command->info('✓ Assessment types seeded (8 types)');
    }
}

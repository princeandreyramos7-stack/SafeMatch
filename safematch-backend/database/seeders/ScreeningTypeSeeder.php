<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NewbornScreeningType;

class ScreeningTypeSeeder extends Seeder
{
    public function run(): void
    {
        $screeningTypes = [
            [
                'name' => 'Hearing Screening',
                'description' => 'Newborn hearing screening test to detect hearing loss',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Vision Screening',
                'description' => 'Basic eye examination to check for visual problems',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Newborn Metabolic Screening',
                'description' => 'Blood test to screen for metabolic disorders (PKU, hypothyroidism, etc.)',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Critical Congenital Heart Disease Screening',
                'description' => 'Pulse oximetry screening to detect heart defects',
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Bilirubin Level Check',
                'description' => 'Test for jaundice and hyperbilirubinemia',
                'is_required' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Physical Examination',
                'description' => 'Complete physical assessment of the newborn',
                'is_required' => true,
                'is_active' => true,
            ],
        ];

        foreach ($screeningTypes as $type) {
            NewbornScreeningType::firstOrCreate(
                ['name' => $type['name']],
                $type
            );
        }

        $this->command->info('✓ Screening types seeded (6 types)');
    }
}

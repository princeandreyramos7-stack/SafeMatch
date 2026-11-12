<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MaternalAssessment;
use App\Models\Mother;
use App\Models\MaternalAssessmentType;
use App\Models\User;
use Carbon\Carbon;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $personnel = User::where('role', 'healthcare_personnel')->first();
        $mothers = Mother::all();
        $assessmentTypes = MaternalAssessmentType::where('is_active', true)->get();
        
        if ($mothers->isEmpty() || $assessmentTypes->isEmpty()) {
            $this->command->error('Missing mothers or assessment types. Run previous seeders first.');
            return;
        }

        $assessmentCount = 0;

        // Create assessments for each mother
        foreach ($mothers as $index => $mother) {
            $admissionDate = Carbon::parse($mother->admission_date);
            
            // Create multiple assessments over time
            foreach ($assessmentTypes as $typeIndex => $type) {
                $numAssessments = rand(2, 5); // 2-5 assessments per type
                
                for ($i = 0; $i < $numAssessments; $i++) {
                    $hoursAgo = $i * $type->frequency_hours;
                    $assessmentDate = Carbon::now()->subHours($hoursAgo);
                    
                    // Don't create assessments before admission
                    if ($assessmentDate->lt($admissionDate)) {
                        continue;
                    }
                    
                    $status = $this->getRandomStatus($index, $typeIndex, $i);
                    
                    MaternalAssessment::create([
                        'mother_id' => $mother->id,
                        'assessment_type_id' => $type->id,
                        'assessed_by' => $personnel->id,
                        'assessment_date' => $assessmentDate,
                        'status' => $status === 'normal' || $status === 'abnormal' || $status === 'requires_attention' || $status === 'critical' ? 'completed' : 'pending',
                        'findings' => $this->getFindings($type->name, $status),
                        'remarks' => $this->getNotes($type->name, $status),
                    ]);
                    
                    $assessmentCount++;
                }
            }
        }

        $this->command->info("✓ Assessments seeded ($assessmentCount assessments)");
    }

    private function getRandomStatus($motherIndex, $typeIndex, $assessmentNum): string
    {
        // Most assessments are normal, some abnormal, few critical
        $weights = [
            'normal' => 70,
            'abnormal' => 20,
            'requires_attention' => 8,
            'critical' => 2,
        ];
        
        // First mother has mostly normal assessments
        if ($motherIndex === 0) {
            return 'normal';
        }
        
        // Create at least one critical assessment for dashboard alerts
        if ($motherIndex === 1 && $typeIndex === 0 && $assessmentNum === 0) {
            return 'critical';
        }
        
        // Create some "requires attention" for second mother
        if ($motherIndex === 2 && $assessmentNum === 0) {
            return 'requires_attention';
        }
        
        // Random weighted selection
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $status => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $status;
            }
        }
        
        return 'normal';
    }

    private function getFindings(string $assessmentName, string $status): array
    {
        $findings = [
            'Vital Signs' => [
                'normal' => [
                    'blood_pressure' => '110/70 mmHg',
                    'temperature' => '36.8°C',
                    'pulse' => '78 bpm',
                    'respiratory_rate' => '16 breaths/min',
                ],
                'abnormal' => [
                    'blood_pressure' => '145/95 mmHg',
                    'temperature' => '37.8°C',
                    'pulse' => '95 bpm',
                    'respiratory_rate' => '18 breaths/min',
                ],
                'requires_attention' => [
                    'blood_pressure' => '150/100 mmHg',
                    'temperature' => '38.2°C',
                    'pulse' => '110 bpm',
                    'respiratory_rate' => '22 breaths/min',
                ],
                'critical' => [
                    'blood_pressure' => '170/110 mmHg',
                    'temperature' => '39.1°C',
                    'pulse' => '125 bpm',
                    'respiratory_rate' => '26 breaths/min',
                ],
            ],
            'Postpartum Bleeding Assessment' => [
                'normal' => ['lochia_amount' => 'Moderate', 'lochia_color' => 'Rubra', 'odor' => 'Normal'],
                'abnormal' => ['lochia_amount' => 'Heavy', 'lochia_color' => 'Rubra with clots', 'odor' => 'Slightly foul'],
                'requires_attention' => ['lochia_amount' => 'Very heavy', 'lochia_color' => 'Bright red', 'odor' => 'Foul'],
                'critical' => ['lochia_amount' => 'Saturating pad in <1 hour', 'lochia_color' => 'Bright red with large clots', 'odor' => 'Offensive'],
            ],
            'Pain Assessment' => [
                'normal' => ['pain_scale' => '2/10', 'pain_location' => 'Minimal discomfort'],
                'abnormal' => ['pain_scale' => '5/10', 'pain_location' => 'Lower abdomen'],
                'requires_attention' => ['pain_scale' => '7/10', 'pain_location' => 'Severe cramping'],
                'critical' => ['pain_scale' => '9/10', 'pain_location' => 'Severe unrelenting pain'],
            ],
            'Uterine Fundal Assessment' => [
                'normal' => ['fundal_height' => 'At umbilicus', 'tone' => 'Firm', 'position' => 'Midline'],
                'abnormal' => ['fundal_height' => 'Above umbilicus', 'tone' => 'Soft', 'position' => 'Slightly deviated'],
                'requires_attention' => ['fundal_height' => '2cm above umbilicus', 'tone' => 'Boggy', 'position' => 'Deviated right'],
                'critical' => ['fundal_height' => 'Significantly elevated', 'tone' => 'Atonic', 'position' => 'Markedly deviated'],
            ],
        ];

        $defaultFindings = [
            'normal' => ['status' => 'Within normal limits'],
            'abnormal' => ['status' => 'Some abnormalities noted'],
            'requires_attention' => ['status' => 'Requires medical attention'],
            'critical' => ['status' => 'Critical findings, immediate intervention needed'],
        ];

        return $findings[$assessmentName][$status] ?? $defaultFindings[$status];
    }

    private function getNotes(string $assessmentName, string $status): ?string
    {
        if ($status === 'normal') {
            return null;
        }

        $notes = [
            'abnormal' => 'Continuing to monitor closely',
            'requires_attention' => 'Physician notified, interventions initiated',
            'critical' => 'URGENT: Physician at bedside, emergency protocols activated',
        ];

        return $notes[$status] ?? null;
    }
}

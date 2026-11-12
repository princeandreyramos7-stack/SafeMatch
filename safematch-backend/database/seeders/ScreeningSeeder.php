<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NewbornScreening;
use App\Models\Newborn;
use App\Models\NewbornScreeningType;
use App\Models\User;
use Carbon\Carbon;

class ScreeningSeeder extends Seeder
{
    public function run(): void
    {
        $personnel = User::where('role', 'healthcare_personnel')->first();
        $newborns = Newborn::all();
        $screeningTypes = NewbornScreeningType::where('is_active', true)->get();
        
        if ($newborns->isEmpty() || $screeningTypes->isEmpty()) {
            $this->command->error('Missing newborns or screening types. Run previous seeders first.');
            return;
        }

        $screeningCount = 0;

        // Create screenings for each newborn
        foreach ($newborns as $index => $newborn) {
            $birthDate = Carbon::parse($newborn->date_time_of_birth);
            
            // Vary the number of screenings per newborn (some complete, some pending)
            $numScreenings = ($index < 2) ? $screeningTypes->count() : rand(2, 4);
            
            foreach ($screeningTypes->take($numScreenings) as $typeIndex => $type) {
                $result = $this->getRandomResult($index, $typeIndex);
                $status = $result === 'pending' ? 'pending' : 'completed';
                
                NewbornScreening::create([
                    'newborn_id' => $newborn->id,
                    'screening_type_id' => $type->id,
                    'assigned_personnel_id' => $personnel->id,
                    'performed_date' => $birthDate->copy()->addHours(rand(12, 48))->format('Y-m-d'),
                    'status' => $status,
                    'result' => $this->getFindings($type->name, $result),
                    'remarks' => $this->getNotes($type->name, $result),
                    'completed_at' => $status === 'completed' ? $birthDate->copy()->addHours(rand(12, 48)) : null,
                ]);
                
                $screeningCount++;
            }
        }

        $this->command->info("✓ Screenings seeded ($screeningCount screenings)");
    }

    private function getRandomResult($newbornIndex, $typeIndex): string
    {
        // Most results are passed, some failed, few pending
        $weights = [
            'passed' => 70,
            'failed' => 10,
            'inconclusive' => 5,
            'pending' => 15,
        ];
        
        // Make first newborn have all passed tests
        if ($newbornIndex === 0) {
            return 'passed';
        }
        
        // Random weighted selection
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $result => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $result;
            }
        }
        
        return 'passed';
    }

    private function getFindings(string $screeningName, string $result): ?string
    {
        if ($result === 'pending') {
            return null;
        }

        $findings = [
            'Hearing Screening' => [
                'passed' => 'Both ears responded normally to automated auditory brainstem response (AABR) test',
                'failed' => 'No response detected in left ear, refer for diagnostic evaluation',
                'inconclusive' => 'Test results unclear due to ambient noise, retest recommended',
            ],
            'Vision Screening' => [
                'passed' => 'Pupillary light reflex present bilaterally, red reflex normal',
                'failed' => 'Abnormal red reflex in right eye, possible cataract',
                'inconclusive' => 'Difficulty assessing due to infant agitation',
            ],
            'Newborn Metabolic Screening' => [
                'passed' => 'All metabolic markers within normal range',
                'failed' => 'Elevated TSH level detected, possible congenital hypothyroidism',
                'inconclusive' => 'Insufficient sample, repeat collection needed',
            ],
            'Critical Congenital Heart Disease Screening' => [
                'passed' => 'Oxygen saturation >95% in right hand and foot',
                'failed' => 'Oxygen saturation 88% in foot, possible congenital heart defect',
                'inconclusive' => 'Borderline readings, repeat in 1 hour',
            ],
            'Bilirubin Level Check' => [
                'passed' => 'Bilirubin level 8 mg/dL, within normal range',
                'failed' => 'Bilirubin level 18 mg/dL, phototherapy initiated',
                'inconclusive' => 'Slight elevation at 12 mg/dL, monitor closely',
            ],
            'Physical Examination' => [
                'passed' => 'Complete physical exam normal, no abnormalities detected',
                'failed' => 'Heart murmur detected, cardiology consultation requested',
                'inconclusive' => 'Unable to complete full exam, infant sleeping',
            ],
        ];

        return $findings[$screeningName][$result] ?? 'Standard findings for ' . strtolower($result) . ' test';
    }

    private function getNotes(string $screeningName, string $result): ?string
    {
        if ($result === 'pending') {
            return 'Screening scheduled';
        }

        if ($result === 'passed') {
            return null; // No notes needed for passed tests
        }

        $notes = [
            'failed' => 'Parent notified, follow-up appointment scheduled',
            'inconclusive' => 'Retest scheduled within 24 hours',
        ];

        return $notes[$result] ?? null;
    }
}

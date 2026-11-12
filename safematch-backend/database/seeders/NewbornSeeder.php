<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Newborn;
use App\Models\Mother;
use App\Models\User;
use Carbon\Carbon;

class NewbornSeeder extends Seeder
{
    public function run(): void
    {
        $personnel = User::where('role', 'healthcare_personnel')->first();
        $mothers = Mother::all();
        
        if ($mothers->isEmpty()) {
            $this->command->error('No mothers found. Run MotherSeeder first.');
            return;
        }

        $newborns = [
            [
                'mother_id' => $mothers[0]->id,
                'full_name' => 'Baby Boy Santos',
                'sex' => 'male',
                'date_time_of_birth' => Carbon::now()->subDays(2)->setTime(14, 30),
                'birth_weight' => 3200,
                'birth_length' => 51,
                'birth_head_circumference' => 35,
                'delivery_info' => 'Normal spontaneous delivery',
                'status' => 'active',
            ],
            [
                'mother_id' => $mothers[1]->id,
                'full_name' => 'Baby Girl Garcia',
                'sex' => 'female',
                'date_time_of_birth' => Carbon::now()->subDays(5)->setTime(10, 15),
                'birth_weight' => 2950,
                'birth_length' => 49,
                'birth_head_circumference' => 34,
                'delivery_info' => 'Cesarean section',
                'status' => 'active',
            ],
            [
                'mother_id' => $mothers[2]->id,
                'full_name' => 'Baby Girl Cruz',
                'sex' => 'female',
                'date_time_of_birth' => Carbon::now()->subDay()->setTime(8, 45),
                'birth_weight' => 3400,
                'birth_length' => 52,
                'birth_head_circumference' => 36,
                'delivery_info' => 'Normal delivery',
                'status' => 'active',
            ],
            [
                'mother_id' => $mothers[3]->id,
                'full_name' => 'Baby Boy Reyes',
                'sex' => 'male',
                'date_time_of_birth' => Carbon::now()->subDays(7)->setTime(16, 20),
                'birth_weight' => 3100,
                'birth_length' => 50,
                'birth_head_circumference' => 35,
                'delivery_info' => 'Assisted delivery',
                'status' => 'active',
            ],
            [
                'mother_id' => $mothers[4]->id,
                'full_name' => 'Twin A Tan',
                'sex' => 'female',
                'date_time_of_birth' => Carbon::now()->subDays(3)->setTime(12, 10),
                'birth_weight' => 2700,
                'birth_length' => 48,
                'birth_head_circumference' => 33,
                'delivery_info' => 'Twin delivery - First born',
                'status' => 'active',
            ],
            [
                'mother_id' => $mothers[4]->id,
                'full_name' => 'Twin B Tan',
                'sex' => 'male',
                'date_time_of_birth' => Carbon::now()->subDays(3)->setTime(12, 15),
                'birth_weight' => 2650,
                'birth_length' => 47,
                'birth_head_circumference' => 33,
                'delivery_info' => 'Twin delivery - Second born',
                'status' => 'active',
            ],
        ];

        foreach ($newborns as $index => $newbornData) {
            Newborn::create(array_merge($newbornData, [
                'newborn_id' => 'NB-' . Carbon::now()->format('Ymd') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'attending_personnel_id' => $personnel->id,
            ]));
        }

        $this->command->info('✓ Newborns seeded (6 newborns including twins)');
    }
}

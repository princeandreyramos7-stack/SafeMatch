<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mother;
use App\Models\User;
use Carbon\Carbon;

class MotherSeeder extends Seeder
{
    public function run(): void
    {
        $personnel = User::where('role', 'healthcare_personnel')->first();
        
        if (!$personnel) {
            $this->command->error('No healthcare personnel found. Run UserSeeder first.');
            return;
        }

        $mothers = [
            [
                'full_name' => 'Maria Clara Santos',
                'date_of_birth' => '1995-06-15',
                'contact_number' => '09171234567',
                'address' => '123 Main St, Manila, Philippines',
                'admission_date' => Carbon::now()->subDays(2),
                'admission_info' => 'Normal pregnancy, full term',
                'status' => 'active',
            ],
            [
                'full_name' => 'Ana Marie Garcia',
                'date_of_birth' => '1992-03-20',
                'contact_number' => '09181234568',
                'address' => '456 Rizal Ave, Quezon City, Philippines',
                'admission_date' => Carbon::now()->subDays(5),
                'admission_info' => 'Scheduled C-section',
                'status' => 'active',
            ],
            [
                'full_name' => 'Rosa Linda Cruz',
                'date_of_birth' => '1998-11-30',
                'contact_number' => '09191234569',
                'address' => '789 Bonifacio St, Makati, Philippines',
                'admission_date' => Carbon::now()->subDay(),
                'admission_info' => 'Labor in progress',
                'status' => 'active',
            ],
            [
                'full_name' => 'Patricia Anne Reyes',
                'date_of_birth' => '1990-08-10',
                'contact_number' => '09201234570',
                'address' => '321 Luna St, Pasig, Philippines',
                'admission_date' => Carbon::now()->subDays(7),
                'admission_info' => 'Postpartum recovery',
                'status' => 'active',
            ],
            [
                'full_name' => 'Josefa Marie Tan',
                'date_of_birth' => '1994-05-25',
                'contact_number' => '09211234571',
                'address' => '654 Del Pilar St, Manila, Philippines',
                'admission_date' => Carbon::now()->subDays(3),
                'admission_info' => 'Twin pregnancy',
                'status' => 'active',
            ],
        ];

        foreach ($mothers as $index => $motherData) {
            $mother = Mother::create(array_merge($motherData, [
                'mother_id' => 'M-' . Carbon::now()->format('Ymd') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'attending_personnel_id' => $personnel->id,
            ]));
        }

        $this->command->info('✓ Mothers seeded (5 mothers)');
    }
}

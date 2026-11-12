<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'administrator',
                'contact_number' => '09123456789',
                'position' => 'System Administrator',
                'is_active' => true,
            ],
            [
                'name' => 'Midwifery User',
                'email' => 'midwifery@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09123456788',
                'position' => 'Midwife',
                'is_active' => true,
            ],
            [
                'name' => 'Nurse Jane',
                'email' => 'nurse@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09123456790',
                'position' => 'Registered Nurse',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Maria Santos',
                'email' => 'doctor@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09123456791',
                'position' => 'Obstetrician',
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✓ Users seeded');
    }
}

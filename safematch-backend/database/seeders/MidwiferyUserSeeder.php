<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class MidwiferyUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $midwives = [
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@safematch.com',
                'password' => Hash::make('midwife123'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09171234567',
                'position' => 'Senior Midwife',
                'is_active' => true,
            ],
            [
                'name' => 'Ana Cruz',
                'email' => 'ana.cruz@safematch.com',
                'password' => Hash::make('midwife123'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09181234567',
                'position' => 'Midwife',
                'is_active' => true,
            ],
            [
                'name' => 'Rosa Reyes',
                'email' => 'rosa.reyes@safematch.com',
                'password' => Hash::make('midwife123'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09191234567',
                'position' => 'Midwife',
                'is_active' => true,
            ],
            [
                'name' => 'Elena Garcia',
                'email' => 'elena.garcia@safematch.com',
                'password' => Hash::make('midwife123'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09201234567',
                'position' => 'Junior Midwife',
                'is_active' => true,
            ],
        ];

        $this->command->info('Creating midwife users...');
        $this->command->newLine();

        foreach ($midwives as $midwife) {
            if (!User::where('email', $midwife['email'])->exists()) {
                User::create($midwife);
                $this->command->info("✓ Created: {$midwife['name']} ({$midwife['email']})");
            } else {
                $this->command->warn("⊘ Already exists: {$midwife['name']} ({$midwife['email']})");
            }
        }

        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════');
        $this->command->info('  LOGIN CREDENTIALS FOR MIDWIVES');
        $this->command->info('═══════════════════════════════════════');
        foreach ($midwives as $midwife) {
            $this->command->info("Email: {$midwife['email']} | Password: midwife123");
        }
        $this->command->info('═══════════════════════════════════════');
    }
}

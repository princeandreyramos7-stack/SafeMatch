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
        // Create midwifery user if not exists
        if (!User::where('email', 'midwifery@safematch.com')->exists()) {
            User::create([
                'name' => 'Midwifery User',
                'email' => 'midwifery@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09123456788',
                'position' => 'Midwife',
                'is_active' => true,
            ]);
            
            $this->command->info('✓ Midwifery user created: midwifery@safematch.com / password');
        } else {
            $this->command->info('✓ Midwifery user already exists');
        }
    }
}

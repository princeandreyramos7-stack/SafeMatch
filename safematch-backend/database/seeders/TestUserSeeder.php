<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if not exists
        if (!User::where('email', 'admin@safematch.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'administrator',
                'contact_number' => '09123456789',
                'position' => 'System Administrator',
                'is_active' => true,
            ]);
            
            $this->command->info('✓ Admin user created: admin@safematch.com / password');
        }
        
        // Create healthcare personnel user if not exists
        if (!User::where('email', 'nurse@safematch.com')->exists()) {
            User::create([
                'name' => 'Nurse Jane',
                'email' => 'nurse@safematch.com',
                'password' => Hash::make('password'),
                'role' => 'healthcare_personnel',
                'contact_number' => '09123456790',
                'position' => 'Registered Nurse',
                'is_active' => true,
            ]);
            
            $this->command->info('✓ Healthcare personnel created: nurse@safematch.com / password');
        }
        
        $this->command->info('');
        $this->command->info('Test users ready! Login credentials:');
        $this->command->info('  Admin: admin@safematch.com / password');
        $this->command->info('  Nurse: nurse@safematch.com / password');
    }
}

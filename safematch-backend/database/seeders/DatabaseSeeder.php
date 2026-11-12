<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            MotherSeeder::class,
            NewbornSeeder::class,
            QRCodeSeeder::class,
            ScreeningTypeSeeder::class,
            ScreeningSeeder::class,
            AssessmentTypeSeeder::class,
            AssessmentSeeder::class,
            DischargeRequirementSeeder::class,
        ]);
        
        $this->command->info('');
        $this->command->info('🎉 Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('  Admin: admin@safematch.com / password');
        $this->command->info('  Midwife: midwifery@safematch.com / password');
        $this->command->info('  Nurse: nurse@safematch.com / password');
    }
}

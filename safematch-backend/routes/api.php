<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public QR Code Image (no auth required for display)
Route::get('qr-codes/{id}/image', [App\Http\Controllers\Api\QRCodeController::class, 'image']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard
    Route::get('/dashboard/statistics', [App\Http\Controllers\Api\DashboardController::class, 'statistics']);
    Route::get('/dashboard/registration-trends', [App\Http\Controllers\Api\DashboardController::class, 'registrationTrends']);
    Route::get('/dashboard/verification-trends', [App\Http\Controllers\Api\DashboardController::class, 'verificationTrends']);
    Route::get('/dashboard/screening-distribution', [App\Http\Controllers\Api\DashboardController::class, 'screeningDistribution']);
    Route::get('/dashboard/assessment-distribution', [App\Http\Controllers\Api\DashboardController::class, 'assessmentDistribution']);
    Route::get('/dashboard/recent-activities', [App\Http\Controllers\Api\DashboardController::class, 'recentActivities']);
    Route::get('/dashboard/alerts', [App\Http\Controllers\Api\DashboardController::class, 'alerts']);
    
    // Analytics and Reporting
    Route::get('/analytics/overview', [App\Http\Controllers\Api\AnalyticsController::class, 'overview']);
    Route::get('/analytics/registration-trends', [App\Http\Controllers\Api\AnalyticsController::class, 'registrationTrends']);
    Route::get('/analytics/screening-analytics', [App\Http\Controllers\Api\AnalyticsController::class, 'screeningAnalytics']);
    Route::get('/analytics/assessment-analytics', [App\Http\Controllers\Api\AnalyticsController::class, 'assessmentAnalytics']);
    Route::get('/analytics/export-csv', [App\Http\Controllers\Api\AnalyticsController::class, 'exportCSV']);
    
    // Mothers
    Route::get('mothers/statistics', [App\Http\Controllers\Api\MotherController::class, 'statistics']);
    Route::apiResource('mothers', App\Http\Controllers\Api\MotherController::class);
    
    // Newborns
    Route::get('newborns/statistics', [App\Http\Controllers\Api\NewbornController::class, 'statistics']);
    Route::get('newborns/available-mothers', [App\Http\Controllers\Api\NewbornController::class, 'availableMothers']);
    Route::apiResource('newborns', App\Http\Controllers\Api\NewbornController::class);
    
    // QR Codes
    Route::get('qr-codes/statistics', [App\Http\Controllers\Api\QRCodeController::class, 'statistics']);
    Route::post('qr-codes/generate', [App\Http\Controllers\Api\QRCodeController::class, 'generate']);
    Route::post('qr-codes/revoke', [App\Http\Controllers\Api\QRCodeController::class, 'revoke']);
    Route::get('qr-codes/{id}/download', [App\Http\Controllers\Api\QRCodeController::class, 'download']);
    // Note: qr-codes/{id}/image is public (defined outside auth middleware)

    // QR Verification
    Route::post('qr-verification/verify-single', [App\Http\Controllers\Api\QRVerificationController::class, 'verifySingle']);
    Route::post('qr-verification/verify-pairing', [App\Http\Controllers\Api\QRVerificationController::class, 'verifyPairing']);
    Route::get('qr-verification/history', [App\Http\Controllers\Api\QRVerificationController::class, 'history']);
    Route::get('qr-verification/statistics', [App\Http\Controllers\Api\QRVerificationController::class, 'statistics']);

    // Newborn Screening Types
    Route::get('screening-types', [App\Http\Controllers\Api\NewbornScreeningTypeController::class, 'index']);
    Route::post('screening-types', [App\Http\Controllers\Api\NewbornScreeningTypeController::class, 'store']);
    Route::put('screening-types/{id}', [App\Http\Controllers\Api\NewbornScreeningTypeController::class, 'update']);
    Route::delete('screening-types/{id}', [App\Http\Controllers\Api\NewbornScreeningTypeController::class, 'destroy']);
    Route::post('screening-types/{id}/toggle-active', [App\Http\Controllers\Api\NewbornScreeningTypeController::class, 'toggleActive']);

    // Newborn Screenings
    Route::get('screenings', [App\Http\Controllers\Api\NewbornScreeningController::class, 'index']);
    Route::post('screenings', [App\Http\Controllers\Api\NewbornScreeningController::class, 'store']);
    Route::get('screenings/statistics', [App\Http\Controllers\Api\NewbornScreeningController::class, 'statistics']);
    Route::get('screenings/newborn/{newbornId}', [App\Http\Controllers\Api\NewbornScreeningController::class, 'getByNewborn']);
    Route::get('screenings/newborn/{newbornId}/completion-rate', [App\Http\Controllers\Api\NewbornScreeningController::class, 'completionRate']);
    Route::get('screenings/{id}', [App\Http\Controllers\Api\NewbornScreeningController::class, 'show']);
    Route::put('screenings/{id}', [App\Http\Controllers\Api\NewbornScreeningController::class, 'update']);
    Route::delete('screenings/{id}', [App\Http\Controllers\Api\NewbornScreeningController::class, 'destroy']);

    // Maternal Assessment Types
    Route::get('assessment-types', [App\Http\Controllers\Api\MaternalAssessmentTypeController::class, 'index']);
    Route::post('assessment-types', [App\Http\Controllers\Api\MaternalAssessmentTypeController::class, 'store']);
    Route::put('assessment-types/{id}', [App\Http\Controllers\Api\MaternalAssessmentTypeController::class, 'update']);
    Route::delete('assessment-types/{id}', [App\Http\Controllers\Api\MaternalAssessmentTypeController::class, 'destroy']);
    Route::post('assessment-types/{id}/toggle-active', [App\Http\Controllers\Api\MaternalAssessmentTypeController::class, 'toggleActive']);

    // Maternal Assessments
    Route::get('maternal-assessments', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'index']);
    Route::post('maternal-assessments', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'store']);
    Route::get('maternal-assessments/statistics', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'statistics']);
    Route::get('maternal-assessments/mother/{motherId}', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'getByMother']);
    Route::get('maternal-assessments/mother/{motherId}/completion-rate', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'completionRate']);
    Route::get('maternal-assessments/{id}', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'show']);
    Route::put('maternal-assessments/{id}', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'update']);
    Route::delete('maternal-assessments/{id}', [App\Http\Controllers\Api\MaternalAssessmentController::class, 'destroy']);

    // Discharge Requirements
    Route::get('discharge-requirements', [App\Http\Controllers\Api\DischargeRequirementController::class, 'index']);
    Route::post('discharge-requirements', [App\Http\Controllers\Api\DischargeRequirementController::class, 'store']);
    Route::put('discharge-requirements/{id}', [App\Http\Controllers\Api\DischargeRequirementController::class, 'update']);
    Route::delete('discharge-requirements/{id}', [App\Http\Controllers\Api\DischargeRequirementController::class, 'destroy']);
    Route::post('discharge-requirements/{id}/toggle-active', [App\Http\Controllers\Api\DischargeRequirementController::class, 'toggleActive']);

    // Discharge Management
    Route::get('discharge/statistics', [App\Http\Controllers\Api\DischargeController::class, 'statistics']);
    Route::get('discharge/recent', [App\Http\Controllers\Api\DischargeController::class, 'recentDecisions']);
    Route::get('discharge/readiness/{motherId}/{newbornId?}', [App\Http\Controllers\Api\DischargeController::class, 'getReadiness']);
    Route::post('discharge/requirement', [App\Http\Controllers\Api\DischargeController::class, 'updateRequirement']);
    Route::post('discharge/decision', [App\Http\Controllers\Api\DischargeController::class, 'createDecision']);
    Route::get('discharge/records', [App\Http\Controllers\Api\DischargeController::class, 'index']);
    
    // Users (Admin only)
    Route::middleware('role:administrator')->group(function () {
        Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
        Route::post('users/{user}/toggle-status', [App\Http\Controllers\Api\UserController::class, 'toggleStatus']);
    });
    
    // Activity Logs
    Route::get('/activity-logs', [App\Http\Controllers\Api\ActivityLogController::class, 'index']);
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/mark-read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\Api\NotificationController::class, 'destroy']);
});

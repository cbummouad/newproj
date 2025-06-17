<?php

use App\Http\Controllers\FormDataController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminDashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Home');
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/complaints', [AdminDashboardController::class, 'getComplaints'])->name('admin.complaints');
    Route::post('/api/logout', [AdminDashboardController::class, 'logout'])->name('logout');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.logout');

    Route::get('/admin', [AdminDashboardController::class, 'index'])->middleware('check.admin')->name('admin.dashboard');
    Route::get('/admin/settings', [AdminDashboardController::class, 'settings'])->middleware('check.admin')->name('admin.settings');
    Route::get('/admin/users', [AdminDashboardController::class, 'manageUsers'])->middleware('check.admin')->name('admin.users');
    Route::post('/admin/users/{user}/role', [AdminDashboardController::class, 'updateRole'])
        ->middleware('check.admin')
        ->name('admin.users.updateRole');

    // New route for updating complaint status
    Route::post('/admin/complaints/{id}/status', [AdminDashboardController::class, 'updateComplaintStatus'])
        ->middleware('check.admin')
        ->name('admin.complaints.updateStatus');

    // Settings routes
    Route::post('/admin/update-password', [AdminDashboardController::class, 'updatePassword'])
        ->middleware('check.admin')
        ->name('admin.updatePassword');
    Route::post('/admin/update-notifications', [AdminDashboardController::class, 'updateNotifications'])
        ->middleware('check.admin')
        ->name('admin.updateNotifications');
    Route::post('/admin/update-system-settings', [AdminDashboardController::class, 'updateSystemSettings'])
        ->middleware('check.admin')
        ->name('admin.updateSystemSettings');
});

Route::post('/form-data', [FormDataController::class, 'store']);

require __DIR__.'/auth.php';

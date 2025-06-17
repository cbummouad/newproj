<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FormData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminDashboardController extends Controller
{
    // In UserController.php
public function updateRole(Request $request, User $user)
{
    $validated = $request->validate([
        'role' => 'required|string|in:user,admin',
    ]);

    $user->role = $validated['role'];
    $user->save();

    return response()->json(['success' => true]);
}
    public function index()
    {
        return inertia('AdminDashboard'); // Redirecting to the AdminDashboard component
    }

    public function getComplaints()
    {
        $complaints = FormData::all(); // Fetch all complaints from the FormData model
        return response()->json($complaints); // Return complaints as JSON
    }

    public function manageUsers()
    {
        $users = User::all(); // Fetch all users
        return response()->json($users); // Return users as JSON
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|min:8|confirmed'
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->new_password);
        $user->save();

        return back()->with('success', 'Password updated successfully');
    }

    public function updateNotifications(Request $request)
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean'
        ]);

        $user = $request->user();
        $user->email_notifications = $request->email_notifications ?? false;
        $user->push_notifications = $request->push_notifications ?? false;
        $user->save();

        return back()->with('success', 'Notification preferences updated');
    }

    public function updateSystemSettings(Request $request)
    {
        $request->validate([
            'timezone' => 'required|timezone',
            'language' => 'required|in:en,fr,ar'
        ]);

        $user = $request->user();
        $user->timezone = $request->timezone;
        $user->language = $request->language;
        $user->save();

        return back()->with('success', 'System settings updated');
    }
    public function updateComplaintStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:in_progress,rejected,resolved',
        ]);

        $complaint = FormData::findOrFail($id);
        $complaint->status = $validated['status'];
        $complaint->save();

        return response()->json(['success' => true]);
    }
}

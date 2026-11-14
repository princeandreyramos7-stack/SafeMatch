<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['healthcare_personnel'])], // Only healthcare_personnel allowed
            'contact_number' => 'required|digits:11', // Exactly 11 digits
            'position' => 'required|string|max:255', // Required
            'is_active' => 'boolean',
        ], [
            'contact_number.required' => 'Contact number is required',
            'contact_number.digits' => 'Contact number must be exactly 11 digits',
            'position.required' => 'Position is required',
            'role.in' => 'Role must be Healthcare Personnel',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->log('Created new user');

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['sometimes', 'required', Rule::in(['healthcare_personnel'])], // Only healthcare_personnel allowed
            'contact_number' => 'required|digits:11', // Exactly 11 digits
            'position' => 'required|string|max:255', // Required
            'is_active' => 'boolean',
        ], [
            'contact_number.required' => 'Contact number is required',
            'contact_number.digits' => 'Contact number must be exactly 11 digits',
            'position.required' => 'Position is required',
            'role.in' => 'Role must be Healthcare Personnel',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->log('Updated user');

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user)
    {
        // Prevent deleting own account
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        // Log activity before deletion
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->log('Deleted user');

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(Request $request, User $user)
    {
        // Prevent deactivating own account
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot deactivate your own account',
            ], 403);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->log($user->is_active ? 'Activated user' : 'Deactivated user');

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Update authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'contact_number' => 'required|digits:11',
            'position' => 'required|string|max:255',
            'current_password' => 'nullable|required_with:password|string',
            'password' => 'nullable|string|min:8|confirmed',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ], [
            'contact_number.required' => 'Contact number is required',
            'contact_number.digits' => 'Contact number must be exactly 11 digits',
            'position.required' => 'Position is required',
            'current_password.required_with' => 'Current password is required to change password',
            'password.min' => 'New password must be at least 8 characters',
            'password.confirmed' => 'Password confirmation does not match',
            'profile_picture.image' => 'File must be an image',
            'profile_picture.mimes' => 'Profile picture must be a jpeg, png, jpg, or gif file',
            'profile_picture.max' => 'Profile picture must not exceed 2MB',
        ]);

        // If changing password, verify current password
        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => [
                        'current_password' => ['Current password is incorrect'],
                    ],
                ], 422);
            }
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                \Storage::disk('public')->delete($user->profile_picture);
            }

            // Store new profile picture
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $validated['profile_picture'] = $path;
        }

        // Remove password-related fields that shouldn't be updated directly
        unset($validated['current_password']);
        unset($validated['password_confirmation']);

        $user->update($validated);

        // Refresh the user model to get updated data
        $user->refresh();

        // Log activity
        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->log('Updated profile');

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }
}

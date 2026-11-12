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
            'role' => ['required', Rule::in(['administrator', 'healthcare_personnel'])],
            'contact_number' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'is_active' => 'boolean',
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
            'role' => ['sometimes', 'required', Rule::in(['administrator', 'healthcare_personnel'])],
            'contact_number' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'is_active' => 'boolean',
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
}

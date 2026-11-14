import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { User, Mail, Phone, Briefcase, Lock, Save, Camera, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    position: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || '',
        email: authUser.email || '',
        contact_number: authUser.contact_number || '',
        position: authUser.position || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      
      // Set profile picture if exists
      if (authUser.profile_picture) {
        setProfilePicturePreview(`${axios.defaults.baseURL}/storage/${authUser.profile_picture}`);
      }
    }
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle contact number - only digits, max 11
    if (name === 'contact_number') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly.slice(0, 11),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = ['Name is required'];
    }

    if (!formData.email.trim()) {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = ['Contact number is required'];
    } else if (formData.contact_number.length !== 11) {
      newErrors.contact_number = ['Contact number must be exactly 11 digits'];
    }

    if (!formData.position.trim()) {
      newErrors.position = ['Position is required'];
    }

    // Password validation (only if changing password)
    if (formData.new_password || formData.current_password) {
      if (!formData.current_password) {
        newErrors.current_password = ['Current password is required to change password'];
      }
      
      if (formData.new_password && formData.new_password.length < 8) {
        newErrors.new_password = ['New password must be at least 8 characters'];
      }
      
      if (formData.new_password !== formData.new_password_confirmation) {
        newErrors.new_password_confirmation = ['Passwords do not match'];
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Use FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('email', formData.email);
      submitFormData.append('contact_number', formData.contact_number);
      submitFormData.append('position', formData.position);

      if (formData.new_password && formData.current_password) {
        submitFormData.append('current_password', formData.current_password);
        submitFormData.append('password', formData.new_password);
        submitFormData.append('password_confirmation', formData.new_password_confirmation);
      }

      // Add profile picture if selected
      if (profilePicture) {
        submitFormData.append('profile_picture', profilePicture);
      }

      const response = await axios.post('/profile', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update local storage and AuthContext with new user data
      if (response.data.user) {
        // Update AuthContext which also updates localStorage
        updateUser(response.data.user);
        
        // Update profile picture preview
        if (response.data.user.profile_picture) {
          setProfilePicturePreview(`${axios.defaults.baseURL}/storage/${response.data.user.profile_picture}`);
        }
      }

      toast.success('Profile updated successfully!');
      
      // Clear password fields and profile picture file
      setProfilePicture(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      }));
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View and update your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft-lg p-6 border border-gray-100">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-primary hover:bg-primary hover:text-white transition"
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{authUser?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{authUser?.position}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {authUser?.email}
                </div>
                {authUser?.contact_number && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
                    <Phone className="w-4 h-4" />
                    {authUser.contact_number}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft-lg p-6 border border-gray-100 space-y-6">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />

            {/* Profile Picture Upload Section */}
            {profilePicture && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">New profile picture selected</p>
                      <p className="text-xs text-blue-700">{profilePicture.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="contact_number"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      required
                      maxLength={11}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                        errors.contact_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="09123456789"
                    />
                  </div>
                  {errors.contact_number && (
                    <p className="mt-1 text-sm text-red-500">{errors.contact_number[0]}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Must be exactly 11 digits</p>
                </div>

                {/* Position */}
                <div className="md:col-span-2">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                        errors.position ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Nurse, Doctor, Midwife"
                    />
                  </div>
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-500">{errors.position[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>
              
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                        errors.current_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                  </div>
                  {errors.current_password && (
                    <p className="mt-1 text-sm text-red-500">{errors.current_password[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        minLength={8}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                          errors.new_password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Min 8 characters"
                      />
                    </div>
                    {errors.new_password && (
                      <p className="mt-1 text-sm text-red-500">{errors.new_password[0]}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        id="new_password_confirmation"
                        name="new_password_confirmation"
                        value={formData.new_password_confirmation}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                          errors.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                    </div>
                    {errors.new_password_confirmation && (
                      <p className="mt-1 text-sm text-red-500">{errors.new_password_confirmation[0]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { X } from 'lucide-react';

interface MotherFormProps {
  mother: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MotherForm({ mother, onClose, onSuccess }: MotherFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    contact_number: '',
    address: '',
    admission_info: '',
    admission_date: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mother) {
      setFormData({
        full_name: mother.full_name || '',
        date_of_birth: mother.date_of_birth || '',
        contact_number: mother.contact_number || '',
        address: mother.address || '',
        admission_info: mother.admission_info || '',
        admission_date: mother.admission_date || '',
        status: mother.status || 'active',
      });
    }
  }, [mother]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mother) {
        await axios.put(`/mothers/${mother.id}`, formData);
        toast.success('Mother updated successfully');
      } else {
        await axios.post('/mothers', formData);
        toast.success('Mother registered successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {mother ? 'Edit Mother Record' : 'Register New Mother'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter mother's full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-500">{errors.full_name[0]}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-500">{errors.date_of_birth[0]}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="text"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.contact_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., +63 912 345 6789"
              />
              {errors.contact_number && (
                <p className="mt-1 text-sm text-red-500">{errors.contact_number[0]}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter complete address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address[0]}</p>
              )}
            </div>

            {/* Admission Date */}
            <div>
              <label htmlFor="admission_date" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Date
              </label>
              <input
                type="date"
                id="admission_date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.admission_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.admission_date && (
                <p className="mt-1 text-sm text-red-500">{errors.admission_date[0]}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="discharged">Discharged</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-500">{errors.status[0]}</p>
              )}
            </div>

            {/* Admission Info */}
            <div className="md:col-span-2">
              <label htmlFor="admission_info" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Information
              </label>
              <textarea
                id="admission_info"
                name="admission_info"
                value={formData.admission_info}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                  errors.admission_info ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter relevant admission details, medical history, etc."
              />
              {errors.admission_info && (
                <p className="mt-1 text-sm text-red-500">{errors.admission_info[0]}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {loading ? 'Saving...' : mother ? 'Update Mother' : 'Register Mother'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { X } from 'lucide-react';

interface ScreeningFormProps {
  screening?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScreeningForm({ screening, onClose, onSuccess }: ScreeningFormProps) {
  const [formData, setFormData] = useState({
    newborn_id: screening?.newborn_id || '',
    screening_type_id: screening?.screening_type_id || '',
    performed_date: screening?.performed_date ? new Date(screening.performed_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: screening?.status || 'completed',
    result: screening?.result || 'pending',
    remarks: screening?.remarks || '',
  });
  const [newborns, setNewborns] = useState<any[]>([]);
  const [screeningTypes, setScreeningTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchNewborns();
    fetchScreeningTypes();
  }, []);

  const fetchNewborns = async () => {
    try {
      const response = await axios.get('/newborns?status=active');
      setNewborns(response.data.data || []);
    } catch (error) {
      console.error('Error fetching newborns:', error);
    }
  };

  const fetchScreeningTypes = async () => {
    try {
      const response = await axios.get('/screening-types?is_active=1');
      setScreeningTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching screening types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (screening) {
        await axios.put(`/screenings/${screening.id}`, formData);
        toast.success('Screening updated successfully');
      } else {
        await axios.post('/screenings', formData);
        toast.success('Screening recorded successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving screening:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save screening');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {screening ? 'Edit Screening' : 'Record New Screening'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Newborn Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Newborn <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.newborn_id}
              onChange={(e) => setFormData({ ...formData, newborn_id: e.target.value })}
              required
              disabled={!!screening}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Newborn</option>
              {newborns.map((newborn) => (
                <option key={newborn.id} value={newborn.id}>
                  {newborn.full_name || 'Unnamed'} ({newborn.newborn_id})
                </option>
              ))}
            </select>
            {errors.newborn_id && (
              <p className="mt-1 text-sm text-red-600">{errors.newborn_id[0]}</p>
            )}
          </div>

          {/* Screening Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screening Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.screening_type_id}
              onChange={(e) => setFormData({ ...formData, screening_type_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Screening Type</option>
              {screeningTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.is_mandatory && '(Mandatory)'}
                </option>
              ))}
            </select>
            {errors.screening_type_id && (
              <p className="mt-1 text-sm text-red-600">{errors.screening_type_id[0]}</p>
            )}
          </div>

          {/* Date Performed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Performed <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.performed_date}
              onChange={(e) => setFormData({ ...formData, performed_date: e.target.value })}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.performed_date && (
              <p className="mt-1 text-sm text-red-600">{errors.performed_date[0]}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not_applicable">Not Applicable</option>
              <option value="requires_followup">Requires Followup</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status[0]}</p>
            )}
          </div>

          {/* Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <select
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="inconclusive">Inconclusive</option>
            </select>
            {errors.result && (
              <p className="mt-1 text-sm text-red-600">{errors.result[0]}</p>
            )}
          </div>

          {/* Findings/Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Findings & Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={4}
              placeholder="Enter screening findings, observations, and remarks..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.remarks && (
              <p className="mt-1 text-sm text-red-600">{errors.remarks[0]}</p>
            )}
          </div>

          {/* Actions */}
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
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {loading ? 'Saving...' : screening ? 'Update Screening' : 'Record Screening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

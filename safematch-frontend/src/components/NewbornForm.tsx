import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { X } from 'lucide-react';

interface NewbornFormProps {
  newborn: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewbornForm({ newborn, onClose, onSuccess }: NewbornFormProps) {
  const [formData, setFormData] = useState({
    mother_id: '',
    full_name: '',
    date_time_of_birth: '',
    sex: 'undetermined',
    birth_weight: '',
    birth_length: '',
    birth_head_circumference: '',
    delivery_info: '',
    status: 'active',
  });
  const [mothers, setMothers] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMothers();
    if (newborn) {
      setFormData({
        mother_id: newborn.mother?.id || '',
        full_name: newborn.full_name || '',
        date_time_of_birth: newborn.date_time_of_birth?.slice(0, 16) || '',
        sex: newborn.sex || 'undetermined',
        birth_weight: newborn.birth_weight || '',
        birth_length: newborn.birth_length || '',
        birth_head_circumference: newborn.birth_head_circumference || '',
        delivery_info: newborn.delivery_info || '',
        status: newborn.status || 'active',
      });
    }
  }, [newborn]);

  const fetchMothers = async () => {
    try {
      const response = await axios.get('/newborns/available-mothers');
      setMothers(response.data);
    } catch (error) {
      console.error('Error fetching mothers:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (newborn) {
        await axios.put(`/newborns/${newborn.id}`, formData);
        toast.success('Newborn updated successfully');
      } else {
        await axios.post('/newborns', formData);
        toast.success('Newborn registered successfully');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{newborn ? 'Edit Newborn' : 'Register Newborn'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother <span className="text-red-500">*</span></label>
              <select name="mother_id" value={formData.mother_id} onChange={handleChange} required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.mother_id ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select Mother</option>
                {mothers.map(m => (<option key={m.id} value={m.id}>{m.full_name} ({m.mother_id})</option>))}
              </select>
              {errors.mother_id && <p className="mt-1 text-sm text-red-500">{errors.mother_id[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Optional"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time of Birth <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="date_time_of_birth" value={formData.date_time_of_birth} onChange={handleChange} required max={new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.date_time_of_birth ? 'border-red-500' : 'border-gray-300'}`}/>
              {errors.date_time_of_birth && <p className="mt-1 text-sm text-red-500">{errors.date_time_of_birth[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sex <span className="text-red-500">*</span></label>
              <select name="sex" value={formData.sex} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="undetermined">Undetermined</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Weight (grams)</label>
              <input type="number" name="birth_weight" value={formData.birth_weight} onChange={handleChange} min="0" step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g., 3200"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Length (cm)</label>
              <input type="number" name="birth_length" value={formData.birth_length} onChange={handleChange} min="0" step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g., 50"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Head Circumference (cm)</label>
              <input type="number" name="birth_head_circumference" value={formData.birth_head_circumference} onChange={handleChange} min="0" step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g., 35"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="active">Active</option>
                <option value="discharged">Discharged</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Information</label>
              <textarea name="delivery_info" value={formData.delivery_info} onChange={handleChange} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Delivery notes, complications, etc."/>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Saving...' : newborn ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

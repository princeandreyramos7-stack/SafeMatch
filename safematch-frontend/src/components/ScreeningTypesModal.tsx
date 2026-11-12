import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { X, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface ScreeningTypesModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScreeningTypesModal({ onClose, onSuccess }: ScreeningTypesModalProps) {
  const [screeningTypes, setScreeningTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    typical_timeframe: '',
    is_mandatory: false,
    is_active: true,
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchScreeningTypes();
  }, []);

  const fetchScreeningTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/screening-types');
      setScreeningTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching screening types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      typical_timeframe: '',
      is_mandatory: false,
      is_active: true,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      typical_timeframe: type.typical_timeframe || '',
      is_mandatory: type.is_mandatory,
      is_active: type.is_active,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingType) {
        await axios.put(`/screening-types/${editingType.id}`, formData);
        alert('Screening type updated successfully');
      } else {
        await axios.post('/screening-types', formData);
        alert('Screening type created successfully');
      }
      setShowForm(false);
      fetchScreeningTypes();
      onSuccess();
    } catch (error: any) {
      console.error('Error saving screening type:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Failed to save screening type');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this screening type?')) return;

    try {
      await axios.delete(`/screening-types/${id}`);
      alert('Screening type deleted successfully');
      fetchScreeningTypes();
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting screening type:', error);
      alert(error.response?.data?.message || 'Failed to delete screening type');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await axios.post(`/screening-types/${id}/toggle-active`);
      fetchScreeningTypes();
      onSuccess();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Manage Screening Types</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Screening Type
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {screeningTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                          {type.is_mandatory && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Mandatory
                            </span>
                          )}
                          {type.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        {type.description && (
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        )}
                        {type.typical_timeframe && (
                          <p className="text-xs text-gray-500 mt-1">
                            Typical timeframe: {type.typical_timeframe}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(type.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                          title={type.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {type.is_active ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {screeningTypes.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No screening types found</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Hearing Screening"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe this screening..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typical Timeframe
                </label>
                <input
                  type="text"
                  value={formData.typical_timeframe}
                  onChange={(e) => setFormData({ ...formData, typical_timeframe: e.target.value })}
                  placeholder="e.g., Within 24-48 hours of birth"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.typical_timeframe && (
                  <p className="mt-1 text-sm text-red-600">{errors.typical_timeframe[0]}</p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Mandatory Screening</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

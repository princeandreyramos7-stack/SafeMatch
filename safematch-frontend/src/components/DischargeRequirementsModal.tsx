import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { X, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface DischargeRequirementsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DischargeRequirementsModal({ onClose, onSuccess }: DischargeRequirementsModalProps) {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applies_to: 'both',
    is_mandatory: true,
    is_active: true,
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/discharge-requirements');
      setRequirements(response.data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRequirement(null);
    setFormData({
      name: '',
      description: '',
      applies_to: 'both',
      is_mandatory: true,
      is_active: true,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (requirement: any) => {
    setEditingRequirement(requirement);
    setFormData({
      name: requirement.name,
      description: requirement.description || '',
      applies_to: requirement.applies_to,
      is_mandatory: requirement.is_mandatory,
      is_active: requirement.is_active,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingRequirement) {
        await axios.put(`/discharge-requirements/${editingRequirement.id}`, formData);
        alert('Requirement updated successfully');
      } else {
        await axios.post('/discharge-requirements', formData);
        alert('Requirement created successfully');
      }
      setShowForm(false);
      fetchRequirements();
      onSuccess();
    } catch (error: any) {
      console.error('Error saving requirement:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Failed to save requirement');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    try {
      await axios.delete(`/discharge-requirements/${id}`);
      alert('Requirement deleted successfully');
      fetchRequirements();
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting requirement:', error);
      alert(error.response?.data?.message || 'Failed to delete requirement');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await axios.post(`/discharge-requirements/${id}/toggle-active`);
      fetchRequirements();
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
          <h2 className="text-2xl font-bold text-gray-900">Manage Discharge Requirements</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
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
                  Add Requirement
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{req.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            req.applies_to === 'mother' ? 'bg-pink-100 text-pink-800' :
                            req.applies_to === 'newborn' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {req.applies_to}
                          </span>
                          {req.is_mandatory && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Mandatory
                            </span>
                          )}
                          {req.is_active ? (
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
                        {req.description && (
                          <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(req.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                        >
                          {req.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleEdit(req)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {requirements.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No discharge requirements found</p>
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
                  placeholder="e.g., All Screenings Completed"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe this requirement..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applies To <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.applies_to}
                  onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="mother">Mother Only</option>
                  <option value="newborn">Newborn Only</option>
                  <option value="both">Both Mother & Newborn</option>
                </select>
                {errors.applies_to && <p className="mt-1 text-sm text-red-600">{errors.applies_to[0]}</p>}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Mandatory Requirement</span>
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
                  {editingRequirement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

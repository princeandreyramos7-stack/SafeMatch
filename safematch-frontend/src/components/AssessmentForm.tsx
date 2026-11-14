import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { X } from 'lucide-react';

interface AssessmentFormProps {
  assessment?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssessmentForm({ assessment, onClose, onSuccess }: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    mother_id: assessment?.mother_id || '',
    assessment_type_id: assessment?.assessment_type_id || '',
    assessment_date: assessment?.assessment_date || new Date().toISOString().slice(0, 16),
    status: assessment?.status || 'normal',
    findings: assessment?.findings ? JSON.stringify(assessment.findings, null, 2) : '',
    notes: assessment?.notes || '',
  });
  const [mothers, setMothers] = useState<any[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchMothers();
    fetchAssessmentTypes();
  }, []);

  const fetchMothers = async () => {
    try {
      const response = await axios.get('/mothers?status=active');
      setMothers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching mothers:', error);
    }
  };

  const fetchAssessmentTypes = async () => {
    try {
      const response = await axios.get('/assessment-types?is_active=1');
      setAssessmentTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching assessment types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Prepare data
    const submitData = {
      ...formData,
      findings: formData.findings ? JSON.parse(formData.findings) : null,
    };

    try {
      if (assessment) {
        await axios.put(`/maternal-assessments/${assessment.id}`, submitData);
        toast.success('Assessment updated successfully');
      } else {
        await axios.post('/maternal-assessments', submitData);
        toast.success('Assessment recorded successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save assessment');
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
            {assessment ? 'Edit Assessment' : 'Record New Assessment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Mother Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mother <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.mother_id}
              onChange={(e) => setFormData({ ...formData, mother_id: e.target.value })}
              required
              disabled={!!assessment}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Mother</option>
              {mothers.map((mother) => (
                <option key={mother.id} value={mother.id}>
                  {mother.full_name} ({mother.mother_id})
                </option>
              ))}
            </select>
            {errors.mother_id && (
              <p className="mt-1 text-sm text-red-600">{errors.mother_id[0]}</p>
            )}
          </div>

          {/* Assessment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.assessment_type_id}
              onChange={(e) => setFormData({ ...formData, assessment_type_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Assessment Type</option>
              {assessmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.is_mandatory && '(Mandatory)'}
                </option>
              ))}
            </select>
            {errors.assessment_type_id && (
              <p className="mt-1 text-sm text-red-600">{errors.assessment_type_id[0]}</p>
            )}
          </div>

          {/* Assessment Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.assessment_date}
              onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
              required
              max={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.assessment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.assessment_date[0]}</p>
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
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="requires_attention">Requires Attention</option>
              <option value="critical">Critical</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status[0]}</p>
            )}
          </div>

          {/* Findings (JSON) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Findings (JSON Format)
            </label>
            <textarea
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              rows={8}
              placeholder='Example:
{
  "blood_pressure": "120/80",
  "temperature": "37.2",
  "pulse": "72",
  "respirations": "16",
  "bleeding": "minimal",
  "pain_level": "2/10"
}'
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            />
            {errors.findings && (
              <p className="mt-1 text-sm text-red-600">{errors.findings[0]}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter clinical findings in JSON format (optional)
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Any additional notes or observations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes[0]}</p>
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
              {loading ? 'Saving...' : assessment ? 'Update Assessment' : 'Record Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

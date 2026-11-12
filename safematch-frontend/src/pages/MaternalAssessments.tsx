import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { Plus, Search, Heart, AlertTriangle, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import AssessmentForm from '../components/AssessmentForm';
import AssessmentTypesModal from '../components/AssessmentTypesModal';

export default function MaternalAssessments() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });
  const [pagination, setPagination] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchAssessments();
    fetchStatistics();
  }, [filters]);

  const fetchAssessments = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page };
      
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'all') params.status = filters.status;

      const response = await axios.get('/maternal-assessments', { params });
      setAssessments(response.data.data || []);
      setPagination(response.data);
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      toast.error(error.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/maternal-assessments/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load assessment statistics');
    }
  };

  const handleCreate = () => {
    setEditingAssessment(null);
    setShowForm(true);
  };

  const handleEdit = (assessment: any) => {
    setEditingAssessment(assessment);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assessment record?')) return;

    try {
      await axios.delete(`/maternal-assessments/${id}`);
      toast.success('Assessment deleted successfully');
      fetchAssessments();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assessment');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssessment(null);
    fetchAssessments();
    fetchStatistics();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires_attention':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'abnormal':
        return <AlertTriangle className="w-4 h-4" />;
      case 'requires_attention':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maternal Assessments</h1>
          <p className="text-gray-600 mt-1">Track and monitor postpartum maternal health</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTypesModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Settings className="w-5 h-5" />
            Manage Types
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <Plus className="w-5 h-5" />
            Record Assessment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.total_assessments}</p>
              </div>
              <Heart className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Normal</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statistics.by_status.normal}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Requires Attention</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{statistics.by_status.requires_attention}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical (24h)</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{statistics.critical_last_24h}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-primary mt-1">{statistics.this_month}</p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by mother ID or name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="abnormal">Abnormal</option>
            <option value="requires_attention">Requires Attention</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No assessments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mother
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessed By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {assessment.mother?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{assessment.mother?.mother_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {assessment.assessment_type?.name}
                          </p>
                          {assessment.assessment_type?.is_mandatory && (
                            <span className="text-xs text-red-600">Mandatory</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(assessment.assessment_date), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {getStatusIcon(assessment.status)}
                          {assessment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assessment.assessed_by?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(assessment)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(assessment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchAssessments(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchAssessments(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <AssessmentForm
          assessment={editingAssessment}
          onClose={() => {
            setShowForm(false);
            setEditingAssessment(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showTypesModal && (
        <AssessmentTypesModal
          onClose={() => setShowTypesModal(false)}
          onSuccess={() => {
            fetchAssessments();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
}

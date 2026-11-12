import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { Plus, Search, Filter, FileText, CheckCircle2, Clock, AlertTriangle, XCircle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import ScreeningForm from '../components/ScreeningForm';
import ScreeningTypesModal from '../components/ScreeningTypesModal';

export default function Screenings() {
  const [screenings, setScreenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [editingScreening, setEditingScreening] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    result: 'all',
  });
  const [pagination, setPagination] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchScreenings();
    fetchStatistics();
  }, [filters]);

  const fetchScreenings = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page };
      
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.result && filters.result !== 'all') params.result = filters.result;

      const response = await axios.get('/screenings', { params });
      setScreenings(response.data.data || []);
      setPagination(response.data);
    } catch (error: any) {
      console.error('Error fetching screenings:', error);
      toast.error(error.response?.data?.message || 'Failed to load screenings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/screenings/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load screening statistics');
    }
  };

  const handleCreate = () => {
    setEditingScreening(null);
    setShowForm(true);
  };

  const handleEdit = (screening: any) => {
    setEditingScreening(screening);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this screening record?')) return;

    try {
      await axios.delete(`/screenings/${id}`);
      toast.success('Screening deleted successfully');
      fetchScreenings();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting screening:', error);
      toast.error(error.response?.data?.message || 'Failed to delete screening');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingScreening(null);
    fetchScreenings();
    fetchStatistics();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'performed':
        return <Clock className="w-4 h-4" />;
      case 'requires_followup':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'performed':
        return 'bg-blue-100 text-blue-800';
      case 'requires_followup':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'inconclusive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newborn Screenings</h1>
          <p className="text-gray-600 mt-1">Track and manage newborn screening procedures</p>
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
            Record Screening
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Screenings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.total_screenings}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statistics.by_status.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Require Followup</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{statistics.by_status.requires_followup}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-primary mt-1">{statistics.this_month}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by newborn ID or name..."
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
            <option value="pending">Pending</option>
            <option value="performed">Performed</option>
            <option value="completed">Completed</option>
            <option value="requires_followup">Requires Followup</option>
          </select>

          <select
            value={filters.result}
            onChange={(e) => setFilters({ ...filters, result: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="inconclusive">Inconclusive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Screenings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : screenings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No screenings found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Newborn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Screening Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Performed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {screenings.map((screening) => (
                    <tr key={screening.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {screening.newborn?.full_name || 'Unnamed'}
                          </p>
                          <p className="text-xs text-gray-500">{screening.newborn?.newborn_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {screening.screening_type?.name}
                          </p>
                          {screening.screening_type?.is_mandatory && (
                            <span className="text-xs text-red-600">Mandatory</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(screening.performed_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            screening.status
                          )}`}
                        >
                          {getStatusIcon(screening.status)}
                          {screening.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {screening.result && (
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getResultColor(
                              screening.result
                            )}`}
                          >
                            {screening.result}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {screening.performed_by?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(screening)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(screening.id)}
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
                    onClick={() => fetchScreenings(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchScreenings(pagination.current_page + 1)}
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
        <ScreeningForm
          screening={editingScreening}
          onClose={() => {
            setShowForm(false);
            setEditingScreening(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showTypesModal && (
        <ScreeningTypesModal
          onClose={() => setShowTypesModal(false)}
          onSuccess={() => {
            fetchScreenings();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
}

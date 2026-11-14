import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { Plus, Search, CheckCircle2, Clock, AlertTriangle, XCircle, Settings, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import DischargeReadinessModal from '../components/DischargeReadinessModal';
import DischargeRequirementsModal from '../components/DischargeRequirementsModal';

export default function Discharge() {
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [selectedMother, setSelectedMother] = useState<any>(null);
  const [selectedNewborn, setSelectedNewborn] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchRecentDecisions();
    fetchStatistics();
  }, [search, statusFilter]);

  const fetchRecentDecisions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/discharge/recent');
      setRecentDecisions(response.data || []);
    } catch (error: any) {
      console.error('Error fetching recent decisions:', error);
      toast.error(error.response?.data?.message || 'Failed to load recent discharge decisions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/discharge/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load discharge statistics');
    }
  };

  const handleCheckReadiness = (mother: any, newborn: any) => {
    setSelectedMother(mother);
    setSelectedNewborn(newborn);
    setShowReadinessModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'discharged':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'discharged':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'approved':
        return <FileCheck className="w-4 h-4" />;
      case 'on_hold':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Discharge Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor discharge readiness and manage patient discharge</p>
        </div>
        <button
          onClick={() => setShowRequirementsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition w-full sm:w-auto justify-center"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden sm:inline">Manage Requirements</span>
          <span className="sm:hidden">Requirements</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by mother or newborn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="on_hold">On Hold</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Discharge</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{statistics.pending_discharge}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Discharged Today</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statistics.discharged_today}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-primary mt-1">{statistics.discharged_this_month}</p>
              </div>
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-up Required</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{statistics.follow_up_required}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              // Open readiness modal without pre-selection
              setSelectedMother(null);
              setSelectedNewborn(null);
              setShowReadinessModal(true);
            }}
            className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition group"
          >
            <FileCheck className="w-6 h-6 text-primary group-hover:text-white" />
            <div className="text-left">
              <p className="font-semibold">Check Readiness</p>
              <p className="text-sm text-gray-600 group-hover:text-white">Assess discharge readiness</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/mothers'}
            className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Search className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <p className="font-semibold">View Mothers</p>
              <p className="text-sm text-gray-600">Browse active patients</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/newborns'}
            className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Search className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <p className="font-semibold">View Newborns</p>
              <p className="text-sm text-gray-600">Browse newborns</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Discharge Decisions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Discharge Decisions</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recentDecisions.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No discharge decisions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mother
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Newborn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discharge Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Decided By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentDecisions.map((decision) => (
                  <tr key={decision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {decision.mother?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{decision.mother?.mother_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {decision.newborn?.full_name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-gray-500">{decision.newborn?.newborn_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          decision.decision_status
                        )}`}
                      >
                        {getStatusIcon(decision.decision_status)}
                        {decision.decision_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {decision.actual_discharge_date
                        ? format(new Date(decision.actual_discharge_date), 'MMM dd, yyyy')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {decision.decided_by?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleCheckReadiness(decision.mother, decision.newborn)}
                        className="text-primary hover:text-primary-dark"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showReadinessModal && (
        <DischargeReadinessModal
          mother={selectedMother}
          newborn={selectedNewborn}
          onClose={() => {
            setShowReadinessModal(false);
            setSelectedMother(null);
            setSelectedNewborn(null);
          }}
          onSuccess={() => {
            fetchRecentDecisions();
            fetchStatistics();
          }}
        />
      )}

      {showRequirementsModal && (
        <DischargeRequirementsModal
          onClose={() => setShowRequirementsModal(false)}
          onSuccess={() => {
            fetchRecentDecisions();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
}

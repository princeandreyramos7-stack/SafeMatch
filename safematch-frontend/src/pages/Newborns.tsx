import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { Plus, Search, Edit, Trash2, Eye, Baby } from 'lucide-react';
import { format } from 'date-fns';
import NewbornForm from '../components/NewbornForm';
import NewbornDetails from '../components/NewbornDetails';

interface Newborn {
  id: number;
  newborn_id: string;
  full_name?: string;
  date_time_of_birth: string;
  sex: string;
  birth_weight?: number;
  birth_length?: number;
  birth_head_circumference?: number;
  status: string;
  mother: {
    id: number;
    mother_id: string;
    full_name: string;
  };
  attending_personnel?: {
    id: number;
    name: string;
  };
  qr_code?: {
    id: number;
    code: string;
    status: string;
  };
  created_at: string;
}

export default function Newborns() {
  const [newborns, setNewborns] = useState<Newborn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingNewborn, setEditingNewborn] = useState<Newborn | null>(null);
  const [viewingNewborn, setViewingNewborn] = useState<Newborn | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNewborns();
  }, [search, statusFilter, sexFilter, currentPage]);

  const fetchNewborns = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 15,
      };
      
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sexFilter) params.sex = sexFilter;
      
      const response = await axios.get('/newborns', { params });
      setNewborns(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error: any) {
      console.error('Error fetching newborns:', error);
      toast.error(error.response?.data?.message || 'Failed to load newborns list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (newbornId: number) => {
    if (!confirm('Are you sure you want to delete this newborn record?')) return;

    try {
      await axios.delete(`/newborns/${newbornId}`);
      toast.success('Newborn record deleted successfully');
      fetchNewborns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete newborn record');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNewborn(null);
    fetchNewborns();
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setViewingNewborn(null);
    fetchNewborns();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-800' },
      discharged: { bg: 'bg-blue-100', text: 'text-blue-800' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSexBadge = (sex: string) => {
    const sexConfig: Record<string, { bg: string; text: string; icon: string }> = {
      male: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '♂' },
      female: { bg: 'bg-pink-100', text: 'text-pink-800', icon: '♀' },
      undetermined: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' },
    };

    const config = sexConfig[sex] || sexConfig.undetermined;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.icon} {sex.charAt(0).toUpperCase() + sex.slice(1)}
      </span>
    );
  };

  const calculateAge = (birthDateTime: string) => {
    const now = new Date();
    const birth = new Date(birthDateTime);
    const diffMs = now.getTime() - birth.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays === 0) {
      return `${diffHours}h old`;
    } else if (diffDays === 1) {
      return '1 day old';
    } else if (diffDays < 30) {
      return `${diffDays} days old`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} old`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newborn Management</h1>
          <p className="text-gray-600 mt-2">Register and manage newborn records</p>
        </div>
        <button
          onClick={() => {
            setEditingNewborn(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          Register Newborn
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, name, or mother..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="">All Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="undetermined">Undetermined</option>
          </select>
        </div>
      </div>

      {/* Newborns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading newborns...</p>
          </div>
        ) : newborns.length === 0 ? (
          <div className="p-12 text-center">
            <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No newborn records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Newborn ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name / Mother
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Birth Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sex
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {newborns.map((newborn) => (
                  <tr key={newborn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {newborn.newborn_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {newborn.full_name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Mother: {newborn.mother.full_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {format(new Date(newborn.date_time_of_birth), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {calculateAge(newborn.date_time_of_birth)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSexBadge(newborn.sex)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {newborn.birth_weight ? `${newborn.birth_weight}g` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(newborn.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setViewingNewborn(newborn);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingNewborn(newborn);
                            setShowForm(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(newborn.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Newborn Form Modal */}
      {showForm && (
        <NewbornForm
          newborn={editingNewborn}
          onClose={() => {
            setShowForm(false);
            setEditingNewborn(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Newborn Details Modal */}
      {showDetails && viewingNewborn && (
        <NewbornDetails
          newbornId={viewingNewborn.id}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { Plus, Search, Edit, Trash2, Eye, QrCode } from 'lucide-react';
import MotherForm from '../components/MotherForm';
import MotherDetails from '../components/MotherDetails';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Mother {
  id: number;
  mother_id: string;
  full_name: string;
  date_of_birth: string;
  contact_number?: string;
  address?: string;
  admission_date?: string;
  status: string;
  attending_personnel?: {
    id: number;
    name: string;
  };
  qr_code?: {
    id: number;
    code: string;
    status: string;
  };
  newborns_count?: number;
  created_at: string;
}

export default function Mothers() {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMother, setDeletingMother] = useState<Mother | null>(null);
  const [editingMother, setEditingMother] = useState<Mother | null>(null);
  const [viewingMother, setViewingMother] = useState<Mother | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMothers();
  }, [search, statusFilter, currentPage]);

  const fetchMothers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 15,
      };
      
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      
      const response = await axios.get('/mothers', { params });
      setMothers(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error: any) {
      console.error('Error fetching mothers:', error);
      toast.error(error.response?.data?.message || 'Failed to load mothers list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (motherId: number) => {
    try {
      await axios.delete(`/mothers/${motherId}`);
      toast.success('Mother record deleted successfully');
      fetchMothers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete mother record');
    }
  };

  const confirmDelete = (mother: Mother) => {
    setDeletingMother(mother);
    setShowDeleteModal(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMother(null);
    fetchMothers();
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setViewingMother(null);
    fetchMothers();
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mother Management</h1>
          <p className="text-gray-600 mt-2">Register and manage mother records</p>
        </div>
        <button
          onClick={() => {
            setEditingMother(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          Register Mother
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, or contact..."
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
        </div>
      </div>

      {/* Mothers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mothers...</p>
          </div>
        ) : mothers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No mother records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mother ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mothers.map((mother) => (
                  <tr key={mother.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {mother.mother_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mother.full_name}</p>
                        {mother.attending_personnel && (
                          <p className="text-xs text-gray-500">
                            Attending: {mother.attending_personnel.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateAge(mother.date_of_birth)} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mother.contact_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(mother.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mother.qr_code ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Generated
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setViewingMother(mother);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMother(mother);
                            setShowForm(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(mother)}
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

      {/* Mother Form Modal */}
      {showForm && (
        <MotherForm
          mother={editingMother}
          onClose={() => {
            setShowForm(false);
            setEditingMother(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Mother Details Modal */}
      {showDetails && viewingMother && (
        <MotherDetails
          motherId={viewingMother.id}
          onClose={handleDetailsClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingMother && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingMother(null);
          }}
          onConfirm={() => handleDelete(deletingMother.id)}
          title="Delete Mother Record"
          message="Are you sure you want to delete this mother record?"
          itemName={deletingMother.full_name}
          itemDetails={`ID: ${deletingMother.mother_id}`}
          warningMessage="This will permanently delete all associated data including newborns, screenings, and assessments."
        />
      )}
    </div>
  );
}

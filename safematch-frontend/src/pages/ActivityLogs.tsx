import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: number;
  causer_type: string;
  causer_id: number;
  properties: any;
  created_at: string;
  causer?: {
    id: number;
    name: string;
  };
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [search, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/activity-logs', {
        params: {
          search,
          page: currentPage,
          per_page: 20,
        },
      });
      setLogs(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (description: string) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('created') || lowerDesc.includes('registered')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerDesc.includes('updated') || lowerDesc.includes('modified')) {
      return 'bg-blue-100 text-blue-800';
    } else if (lowerDesc.includes('deleted') || lowerDesc.includes('removed')) {
      return 'bg-red-100 text-red-800';
    } else if (lowerDesc.includes('login') || lowerDesc.includes('logout')) {
      return 'bg-purple-100 text-purple-800';
    } else if (lowerDesc.includes('verified') || lowerDesc.includes('verification')) {
      return 'bg-teal-100 text-teal-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getSubjectName = (subjectType: string) => {
    if (!subjectType) return 'Unknown';
    const parts = subjectType.split('\\');
    return parts[parts.length - 1];
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">System audit trail and user activities</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(
                          log.description
                        )}`}
                      >
                        {log.description}
                      </span>
                      {log.subject_type && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {getSubjectName(log.subject_type)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">
                        {log.causer?.name || 'System'}
                      </span>
                      <span>•</span>
                      <span>
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    {log.properties && Object.keys(log.properties).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <details className="cursor-pointer">
                          <summary className="hover:text-gray-700">View details</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-40">
                            {JSON.stringify(log.properties, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className="text-xs text-gray-500">ID: {log.id}</span>
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
}

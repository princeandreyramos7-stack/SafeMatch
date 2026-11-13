import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { 
  Search, 
  Clock, 
  UserPlus, 
  Edit, 
  Trash2, 
  LogIn, 
  LogOut, 
  CheckCircle, 
  FileText,
  Activity 
} from 'lucide-react';
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
    if (lowerDesc.includes('created') || lowerDesc.includes('registered') || lowerDesc.includes('added')) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else if (lowerDesc.includes('updated') || lowerDesc.includes('modified') || lowerDesc.includes('edited')) {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    } else if (lowerDesc.includes('deleted') || lowerDesc.includes('removed')) {
      return 'bg-red-100 text-red-800 border border-red-200';
    } else if (lowerDesc.includes('login') || lowerDesc.includes('logged in')) {
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    } else if (lowerDesc.includes('logout') || lowerDesc.includes('logged out')) {
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    } else if (lowerDesc.includes('verified') || lowerDesc.includes('verification') || lowerDesc.includes('matched')) {
      return 'bg-teal-100 text-teal-800 border border-teal-200';
    } else if (lowerDesc.includes('discharged')) {
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    } else if (lowerDesc.includes('assessment')) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getActionIcon = (description: string) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('created') || lowerDesc.includes('registered') || lowerDesc.includes('added')) {
      return <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />;
    } else if (lowerDesc.includes('updated') || lowerDesc.includes('modified') || lowerDesc.includes('edited')) {
      return <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
    } else if (lowerDesc.includes('deleted') || lowerDesc.includes('removed')) {
      return <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />;
    } else if (lowerDesc.includes('login') || lowerDesc.includes('logged in')) {
      return <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />;
    } else if (lowerDesc.includes('logout') || lowerDesc.includes('logged out')) {
      return <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />;
    } else if (lowerDesc.includes('verified') || lowerDesc.includes('verification') || lowerDesc.includes('matched')) {
      return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />;
    } else if (lowerDesc.includes('discharged')) {
      return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />;
    } else if (lowerDesc.includes('assessment') || lowerDesc.includes('screening')) {
      return <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />;
    }
    return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />;
  };

  const getUserFriendlyDescription = (log: ActivityLog) => {
    const description = log.description;
    const subject = getSubjectName(log.subject_type);
    const user = log.causer?.name || 'System';
    
    // Make descriptions more readable
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('created') || lowerDesc.includes('registered')) {
      return `${user} registered a new ${subject}`;
    } else if (lowerDesc.includes('updated') || lowerDesc.includes('modified')) {
      return `${user} updated ${subject} information`;
    } else if (lowerDesc.includes('deleted') || lowerDesc.includes('removed')) {
      return `${user} deleted a ${subject}`;
    } else if (lowerDesc.includes('verified') || lowerDesc.includes('verification')) {
      return `${user} verified QR codes for mother-baby matching`;
    } else if (lowerDesc.includes('login')) {
      return `${user} logged into the system`;
    } else if (lowerDesc.includes('logout')) {
      return `${user} logged out from the system`;
    } else if (lowerDesc.includes('discharged')) {
      return `${user} processed discharge for ${subject}`;
    } else if (lowerDesc.includes('assessment')) {
      return `${user} recorded a maternal assessment`;
    } else if (lowerDesc.includes('screening')) {
      return `${user} recorded a newborn screening`;
    }
    
    return `${user} performed an action on ${subject}`;
  };

  const getSubjectName = (subjectType: string) => {
    if (!subjectType) return 'Unknown';
    const parts = subjectType.split('\\');
    return parts[parts.length - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 animate-fade-in">Activity Logs</h1>
          <p className="text-white/90 text-sm sm:text-lg animate-slide-up">System audit trail and user activities</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft-lg p-3 sm:p-6 border border-gray-100 animate-fade-in">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm sm:text-base transition-all-smooth"
            />
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft-lg border border-gray-100 animate-scale-in">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base font-medium">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm sm:text-base font-medium">No activity logs found</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <div 
                key={log.id} 
                className="p-4 sm:p-6 hover:bg-gray-50 transition-all-smooth group animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-teal-100">
                    {getActionIcon(log.description)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* User-friendly description */}
                    <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                      {getUserFriendlyDescription(log)}
                    </p>
                    
                    {/* Action badge and subject */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                      <span
                        className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${getActionColor(
                          log.description
                        )} transition-transform group-hover:scale-105`}
                      >
                        {log.description}
                      </span>
                      {log.subject_type && (
                        <span className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                          {getSubjectName(log.subject_type)}
                        </span>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(log.created_at), 'MMM dd, yyyy')} at {format(new Date(log.created_at), 'hh:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Log ID */}
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      #{log.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth hover-lift shadow-soft"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            <span className="text-xs sm:text-sm text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth hover-lift shadow-soft"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

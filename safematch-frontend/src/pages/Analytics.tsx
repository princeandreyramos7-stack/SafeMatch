import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import axios from '../lib/axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OverviewStats {
  registrations: {
    mothers: number;
    newborns: number;
  };
  screenings: {
    total: number;
    completed: number;
    pending: number;
    requires_followup: number;
  };
  assessments: {
    total: number;
    completed: number;
    pending: number;
  };
  qr_verifications: {
    total: number;
    matches: number;
    no_matches: number;
  };
  discharges: {
    total: number;
    approved: number;
    pending: number;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [exportType, setExportType] = useState('overview');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics/overview', {
        params: { start_date: startDate, end_date: endDate }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axios.get('/analytics/export-csv', {
        params: {
          type: exportType,
          start_date: startDate,
          end_date: endDate
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `safematch_${exportType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const screeningData = stats ? [
    { name: 'Completed', value: stats.screenings.completed, color: '#10b981' },
    { name: 'Pending', value: stats.screenings.pending, color: '#f59e0b' },
    { name: 'Followup', value: stats.screenings.requires_followup, color: '#ef4444' },
  ] : [];

  const assessmentData = stats ? [
    { name: 'Completed', value: stats.assessments.completed, color: '#10b981' },
    { name: 'Pending', value: stats.assessments.pending, color: '#f59e0b' },
  ] : [];

  const qrVerificationData = stats ? [
    { name: 'Matches', value: stats.qr_verifications.matches, color: '#10b981' },
    { name: 'No Match', value: stats.qr_verifications.no_matches, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="text-gray-600">Comprehensive system analytics and data export</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <Calendar className="text-gray-400" size={24} />
          <div className="flex items-center gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <button
              onClick={fetchAnalytics}
              className="mt-6 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mothers</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.registrations.mothers || 0}</p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Newborns</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.registrations.newborns || 0}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Screenings</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.screenings.total || 0}</p>
            </div>
            <FileText className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.assessments.total || 0}</p>
            </div>
            <BarChart3 className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Screening Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Screening Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={screeningData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {screeningData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assessment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Assessment Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={assessmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assessmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* QR Verification */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">QR Verifications</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={qrVerificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {qrVerificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Export Data</h3>
        <div className="flex items-center gap-4">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="overview">Overview Report</option>
            <option value="mothers">Mothers Data</option>
            <option value="newborns">Newborns Data</option>
            <option value="screenings">Screenings Data</option>
            <option value="assessments">Assessments Data</option>
            <option value="discharges">Discharge Data</option>
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400"
          >
            <Download size={20} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Export data in CSV format for external analysis and reporting
        </p>
      </div>
    </div>
  );
}

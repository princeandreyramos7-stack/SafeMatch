import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import {
  Users,
  Baby,
  QrCode,
  ClipboardCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface Statistics {
  overall: {
    total_mothers: number;
    active_mothers: number;
    total_newborns: number;
    active_newborns: number;
  };
  qr_codes: {
    total_active: number;
    verifications_today: number;
    match_rate: number;
  };
  screenings: {
    pending: number;
    completed: number;
    require_followup: number;
  };
  assessments: {
    critical_24h: number;
    today: number;
  };
  discharge: {
    ready: number;
    pending_approval: number;
    discharged_today: number;
  };
  system: {
    total_users: number;
    active_personnel: number;
  };
}

interface Alert {
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  count: number;
  link: string;
}

interface Activity {
  type: string;
  title: string;
  description: string;
  user: string;
  time: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [verificationTrends, setVerificationTrends] = useState([]);
  const [screeningDistribution, setScreeningDistribution] = useState([]);
  const [assessmentDistribution, setAssessmentDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        regTrendsRes,
        verTrendsRes,
        screenDistRes,
        assessDistRes,
        activitiesRes,
        alertsRes,
      ] = await Promise.all([
        axios.get('/dashboard/statistics'),
        axios.get('/dashboard/registration-trends?days=7'),
        axios.get('/dashboard/verification-trends?days=7'),
        axios.get('/dashboard/screening-distribution'),
        axios.get('/dashboard/assessment-distribution'),
        axios.get('/dashboard/recent-activities?limit=5'),
        axios.get('/dashboard/alerts'),
      ]);

      setStatistics(statsRes.data);
      setRegistrationTrends(regTrendsRes.data);
      setVerificationTrends(verTrendsRes.data);
      setScreeningDistribution(screenDistRes.data);
      setAssessmentDistribution(assessDistRes.data);
      setRecentActivities(activitiesRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mother_registered':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'newborn_registered':
        return <Baby className="w-5 h-5 text-green-600" />;
      case 'qr_verification':
        return <QrCode className="w-5 h-5 text-purple-600" />;
      case 'critical_assessment':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-lg cursor-pointer hover:shadow-md transition ${getAlertColor(
                alert.type
              )}`}
              onClick={() => navigate(alert.link)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Mothers */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate('/mothers')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mothers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.overall.total_mothers}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {statistics.overall.active_mothers} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Newborns */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate('/newborns')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Newborns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.overall.total_newborns}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {statistics.overall.active_newborns} active
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Baby className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* QR Verifications */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate('/qr-verification')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verifications Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.qr_codes.verifications_today}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                {statistics.qr_codes.match_rate}% match rate
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Screenings */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate('/screenings')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Screenings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.screenings.pending}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                {statistics.screenings.require_followup} need followup
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Critical Assessments */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate('/maternal-assessments')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical (24h)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.assessments.critical_24h}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {statistics.assessments.today} today
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Ready for Discharge */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate('/discharge')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready for Discharge</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.discharge.ready}
              </p>
              <p className="text-sm text-teal-600 mt-1">
                {statistics.discharge.discharged_today} discharged today
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Active QR Codes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active QR Codes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.qr_codes.total_active}
              </p>
              <p className="text-sm text-gray-500 mt-1">Generated</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <QrCode className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Personnel</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.system.active_personnel}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {statistics.system.total_users} total users
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Registration Trends (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(String(value)), 'MMM dd, yyyy')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mothers"
                stroke="#3B82F6"
                name="Mothers"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="newborns"
                stroke="#10B981"
                name="Newborns"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            QR Verification Trends (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={verificationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(String(value)), 'MMM dd, yyyy')}
              />
              <Legend />
              <Bar dataKey="matches" fill="#10B981" name="Matches" />
              <Bar dataKey="no_matches" fill="#EF4444" name="No Matches" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Screening Distribution */}
        {screeningDistribution.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Screening Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={screeningDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {screeningDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Assessment Distribution */}
        {assessmentDistribution.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Maternal Assessment Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assessmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assessmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.time), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/mothers')}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
            >
              <span className="text-teal-700 font-medium">Register Mother</span>
              <Plus className="w-5 h-5 text-teal-600" />
            </button>
            <button
              onClick={() => navigate('/newborns')}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
            >
              <span className="text-teal-700 font-medium">Register Newborn</span>
              <Plus className="w-5 h-5 text-teal-600" />
            </button>
            <button
              onClick={() => navigate('/qr-verification')}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
            >
              <span className="text-teal-700 font-medium">QR Verification</span>
              <QrCode className="w-5 h-5 text-teal-600" />
            </button>
            <button
              onClick={() => navigate('/screenings')}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
            >
              <span className="text-teal-700 font-medium">Record Screening</span>
              <Plus className="w-5 h-5 text-teal-600" />
            </button>
            <button
              onClick={() => navigate('/maternal-assessments')}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
            >
              <span className="text-teal-700 font-medium">Record Assessment</span>
              <Plus className="w-5 h-5 text-teal-600" />
            </button>
            <button
              onClick={() => navigate('/discharge')}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
            >
              <span className="text-teal-700 font-medium">Discharge Management</span>
              <ArrowRight className="w-5 h-5 text-teal-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

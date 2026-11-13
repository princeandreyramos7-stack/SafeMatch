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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-primary rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 animate-fade-in">Dashboard</h1>
          <p className="text-white/90 text-sm sm:text-lg animate-slide-up">Welcome back, {user?.name}! 👋</p>
          <p className="text-white/80 text-xs sm:text-sm mt-1 sm:mt-2 animate-slide-up">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2 sm:space-y-3 animate-slide-down">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`border-l-4 p-3 sm:p-5 rounded-lg sm:rounded-xl cursor-pointer transition-all-smooth hover-lift shadow-soft ${getAlertColor(
                alert.type
              )}`}
              onClick={() => navigate(alert.link)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-lg truncate">{alert.title}</p>
                    <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {alert.count > 0 && (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/50 rounded-full font-bold text-sm sm:text-lg">
                      {alert.count}
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Mothers */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth cursor-pointer border border-gray-100 animate-scale-in"
          onClick={() => navigate('/mothers')}
          style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Mothers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.overall.total_mothers}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-success-light rounded-full">
                  <TrendingUp className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-success-dark" />
                  <span className="text-xs font-bold text-success-dark">{statistics.overall.active_mothers} active</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Newborns */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth cursor-pointer border border-gray-100 animate-scale-in"
          onClick={() => navigate('/newborns')}
          style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Newborns</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.overall.total_newborns}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-success-light rounded-full">
                  <TrendingUp className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-success-dark" />
                  <span className="text-xs font-bold text-success-dark">{statistics.overall.active_newborns} active</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* QR Verifications */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth cursor-pointer border border-gray-100 animate-scale-in"
          onClick={() => navigate('/qr-verification')}
          style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verifications Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.qr_codes.verifications_today}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <div className="px-2 py-0.5 bg-purple-100 rounded-full">
                  <span className="text-xs font-bold text-purple-700">{statistics.qr_codes.match_rate}% match rate</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Screenings */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth cursor-pointer border border-gray-100 animate-scale-in"
          onClick={() => navigate('/screenings')}
          style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending Screenings</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.screenings.pending}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <div className="px-2 py-0.5 bg-warning-light rounded-full">
                  <span className="text-xs font-bold text-warning-dark">{statistics.screenings.require_followup} need followup</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Critical Assessments */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth cursor-pointer border border-gray-100 animate-scale-in"
          onClick={() => navigate('/maternal-assessments')}
          style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Critical (24h)</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.assessments.critical_24h}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <div className="px-2 py-0.5 bg-error-light rounded-full">
                  <span className="text-xs font-bold text-error-dark">{statistics.assessments.today} today</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Ready for Discharge */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth cursor-pointer border border-gray-100 animate-scale-in"
          onClick={() => navigate('/discharge')}
          style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ready for Discharge</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.discharge.ready}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <div className="px-2 py-0.5 bg-primary-100 rounded-full">
                  <span className="text-xs font-bold text-primary-700">{statistics.discharge.discharged_today} discharged today</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Active QR Codes */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth border border-gray-100 animate-scale-in"
          style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active QR Codes</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.qr_codes.total_active}
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium">Generated & Active</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="group bg-white rounded-xl shadow-soft p-3 sm:p-4 hover-lift transition-all-smooth border border-gray-100 animate-scale-in"
          style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Personnel</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                {statistics.system.active_personnel}
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium">
                of {statistics.system.total_users} total users
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft flex-shrink-0 ml-2">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Registration Trends */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-6 border border-gray-100 hover-lift transition-all-smooth animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Registration Trends
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium self-start">Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <LineChart data={registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                labelFormatter={(value) => format(new Date(String(value)), 'MMM dd, yyyy')}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="mothers"
                stroke="#3B82F6"
                name="Mothers"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="newborns"
                stroke="#10B981"
                name="Newborns"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Trends */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100 hover-lift transition-all-smooth animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              QR Verification Trends
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={verificationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                labelFormatter={(value) => format(new Date(String(value)), 'MMM dd, yyyy')}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="matches" fill="#10B981" name="Matches" radius={[8, 8, 0, 0]} />
              <Bar dataKey="no_matches" fill="#EF4444" name="No Matches" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Screening Distribution */}
        {screeningDistribution.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100 hover-lift transition-all-smooth animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Assessment Distribution */}
        {assessmentDistribution.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100 hover-lift transition-all-smooth animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Maternal Assessment Status
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-6 border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activities</h2>
            <button 
              onClick={() => navigate('/activity-logs')}
              className="text-xs sm:text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all-smooth group border border-transparent hover:border-gray-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full truncate max-w-[150px]">
                        {activity.user}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {format(new Date(activity.time), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500 font-medium">No recent activities</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Activities will appear here once actions are performed</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-6 border border-primary-200 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Quick Actions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => navigate('/mothers')}
              className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all-smooth group border border-primary-100 hover:border-primary-300"
            >
              <span className="text-primary-800 font-semibold flex items-center gap-2 sm:gap-3 group-hover:text-primary-900 text-sm sm:text-base">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                Register Mother
              </span>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/newborns')}
              className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all-smooth group border border-primary-100 hover:border-primary-300"
            >
              <span className="text-primary-800 font-semibold flex items-center gap-2 sm:gap-3 group-hover:text-primary-900 text-sm sm:text-base">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                Register Newborn
              </span>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/qr-verification')}
              className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all-smooth group border border-primary-100 hover:border-primary-300"
            >
              <span className="text-primary-800 font-semibold flex items-center gap-2 sm:gap-3 group-hover:text-primary-900 text-sm sm:text-base">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                QR Verification
              </span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/screenings')}
              className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all-smooth group border border-primary-100 hover:border-primary-300"
            >
              <span className="text-primary-800 font-semibold flex items-center gap-2 sm:gap-3 group-hover:text-primary-900 text-sm sm:text-base">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                </div>
                Record Screening
              </span>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/maternal-assessments')}
              className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all-smooth group border border-primary-100 hover:border-primary-300"
            >
              <span className="text-primary-800 font-semibold flex items-center gap-2 sm:gap-3 group-hover:text-primary-900 text-sm sm:text-base">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                Record Assessment
              </span>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/discharge')}
              className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all-smooth group border border-primary-100 hover:border-primary-300"
            >
              <span className="text-primary-800 font-semibold flex items-center gap-2 sm:gap-3 group-hover:text-primary-900 text-sm sm:text-base">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                </div>
                Discharge Management
              </span>
              <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

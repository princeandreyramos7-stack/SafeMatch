import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import axios from '../lib/axios';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications', {
        params: {
          unread_only: filter === 'unread'
        }
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/notifications/${id}/mark-read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/notifications/mark-all-read');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await axios.delete(`/notifications/${id}`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const confirmDelete = (notification: Notification) => {
    setDeletingNotification(notification);
    setShowDeleteModal(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical_assessment':
        return <AlertCircle className="text-red-500" size={24} />;
      case 'screening_followup':
        return <Info className="text-yellow-500" size={24} />;
      case 'discharge_approved':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Bell className="text-blue-500" size={24} />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'critical_assessment':
        return 'border-l-4 border-red-500';
      case 'screening_followup':
        return 'border-l-4 border-yellow-500';
      case 'discharge_approved':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <CheckCheck size={20} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                filter === 'unread'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationBorderColor(notification.type)} ${
                  !notification.read_at ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                          {!notification.read_at && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read_at && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-teal-600"
                            title="Mark as read"
                          >
                            <Check size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(notification)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    {notification.action_url && (
                      <button
                        onClick={() => {
                          markAsRead(notification.id);
                          window.location.href = notification.action_url!;
                        }}
                        className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingNotification && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingNotification(null);
          }}
          onConfirm={() => deleteNotification(deletingNotification.id)}
          title="Delete Notification"
          message="Are you sure you want to delete this notification?"
          itemName={deletingNotification.title}
          itemDetails={deletingNotification.message.substring(0, 100)}
        />
      )}
    </div>
  );
}

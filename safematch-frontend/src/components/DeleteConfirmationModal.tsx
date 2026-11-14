import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  itemDetails?: string;
  warningMessage?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemDetails,
  warningMessage = 'This action cannot be undone. All associated data will be permanently deleted.',
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{message}</p>
          
          {(itemName || itemDetails) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              {itemName && (
                <p className="font-semibold text-gray-900 mb-1">{itemName}</p>
              )}
              {itemDetails && (
                <p className="text-sm text-gray-600">{itemDetails}</p>
              )}
            </div>
          )}

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> {warningMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all-smooth font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth font-medium text-sm sm:text-base flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

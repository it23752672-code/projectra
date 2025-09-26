import React from 'react'
import { X, Trash2 } from 'lucide-react'

const ConfirmDeleteModal = ({ title = 'Delete User', message = 'Are you sure you want to delete this user? This action cannot be undone.', onConfirm, onCancel, loading = false }: { title?: string; message?: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className="mt-1 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-4 border-t">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal

import React, { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";

export default function RescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  currentDateTime = "",
}) {
  const [newDateTime, setNewDateTime] = useState(currentDateTime);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newDateTime && newDateTime !== currentDateTime) {
      onConfirm(newDateTime);
    }
  };

  // Format current datetime for min attribute (can't select past dates)
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-100 text-blue-600 mx-auto">
            <Calendar className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Reschedule Session
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Select a new date and time for this mentorship session
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                New Date & Time
              </label>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                min={minDateTime}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {currentDateTime && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <strong>Current time:</strong> {new Date(currentDateTime).toLocaleString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                disabled={loading || !newDateTime || newDateTime === currentDateTime}
              >
                {loading ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
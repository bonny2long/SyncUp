import React from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  confirmColor = "blue", // blue, red, green
  loading = false,
  icon = "alert", // alert, success
}) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (confirmColor) {
      case "red":
        return "bg-red-600 hover:bg-red-700 shadow-red-200";
      case "green":
        return "bg-green-600 hover:bg-green-700 shadow-green-200";
      case "blue":
      default:
        return "bg-blue-600 hover:bg-blue-700 shadow-blue-200";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              icon === "success" ?
                "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
            }`}
          >
            {icon === "success" ?
              <CheckCircle className="w-8 h-8" />
            : <AlertTriangle className="w-8 h-8" />}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl focus:ring-4 focus:ring-opacity-50 transition-all ${getColors()}`}
              disabled={loading}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

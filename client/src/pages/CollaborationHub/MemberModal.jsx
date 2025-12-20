import React from "react";

export default function MemberModal({ members = [], onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-primary">Project Members</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-primary"
          >
            Close
          </button>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No members yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {members.map((m) => (
              <div
                key={m.id || m.name}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {m.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-dark">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  {m.role && (
                    <span className="text-[10px] uppercase tracking-wide bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                      {m.role}
                    </span>
                  )}
                  {m.join_date && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Joined {new Date(m.join_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

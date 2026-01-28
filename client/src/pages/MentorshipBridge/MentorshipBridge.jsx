import React from "react";
import { useUser } from "../../context/UserContext";
import InternView from "./InternView/InternView";
import MentorView from "./MentorView/MentorView";

export default function MentorshipBridge() {
  const { user } = useUser();

  // Role-based routing
  if (user?.role === "intern") {
    return <InternView />;
  }

  if (user?.role === "mentor") {
    return <MentorView />;
  }

  // Fallback for users without role
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Not Set</h2>
        <p className="text-gray-600 mb-4">
          Your account role needs to be configured to access mentorship
          features.
        </p>
        <p className="text-sm text-gray-500">
          Please contact an administrator to set your role as either "intern" or
          "mentor".
        </p>
      </div>
    </div>
  );
}

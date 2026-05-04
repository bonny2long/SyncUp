import React from "react";
import { useUser } from "../../context/UserContext";
import InternView from "./InternView/InternView";
import MentorView from "./MentorView/MentorView";

export default function MentorshipBridge() {
  const { user } = useUser();

  if (user?.role === "intern") {
    return <InternView />;
  }

  if (["mentor", "alumni", "resident"].includes(user?.role)) {
    return <MentorView />;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">
          Contact an iCAA admin to set up your account
        </h2>
        <p className="text-text-secondary">
          Your role needs to be configured by an administrator.
        </p>
      </div>
    </div>
  );
}

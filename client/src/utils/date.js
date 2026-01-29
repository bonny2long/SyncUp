// src/utils/date.js
export function weekLabelFromYearWeek(yearWeek) {
  const year = Number(String(yearWeek).slice(0, 4));
  const week = Number(String(yearWeek).slice(4));
  const d = new Date(year, 0, 1 + (week - 1) * 7);
  const monday = new Date(d.setDate(d.getDate() - d.getDay() + 1));
  return `Week of ${monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

// NEW: Format date from database (handles timestamps and date strings)
export function formatDate(dateStr) {
  if (!dateStr) return "Date TBA";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (err) {
    console.error("Date format error:", err);
    return "Invalid date";
  }
}

// ✨ NEW: Format time from database (handles HH:MM:SS and HH:MM)
export function formatTime(timeStr) {
  if (!timeStr) return "Time TBA";

  try {
    // Handle HH:MM:SS or HH:MM format
    const parts = String(timeStr).split(":");
    const hours = parseInt(parts[0]);
    const minutes = parts[1] || "00";

    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${ampm}`;
  } catch (err) {
    console.error("Time format error:", err);
    return "Time TBA";
  }
}

// ✨ NEW: Format combined date and time for session booking
export function formatDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "Time TBA";

  try {
    const datePart = formatDate(dateStr);
    const timePart = formatTime(timeStr);

    if (datePart === "Invalid date" || timePart === "Time TBA") {
      return "Time TBA";
    }

    return `${datePart} at ${timePart}`;
  } catch (err) {
    console.error("DateTime format error:", err);
    return "Time TBA";
  }
}

// ✨ NEW: Format for compact display (used in cards)
export function formatDateTimeCompact(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "TBA";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "TBA";

    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const timePart = formatTime(timeStr);

    return `${datePart}, ${timePart}`;
  } catch (err) {
    console.error("DateTime compact format error:", err);
    return "TBA";
  }
}

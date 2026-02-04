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
    // If it's a date string like YYYY-MM-DD, extract components directly
    let year, month, day, weekday;
    if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parts = dateStr.split("-");
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
      const date = new Date(year, month, day);
      weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid date";
      year = date.getFullYear();
      month = date.getMonth();
      day = date.getDate();
      weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${weekday}, ${monthNames[month]} ${day}, ${year}`;
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
    const datePart = formatDate(dateStr).split(", ").slice(1, 2).join(""); // Get "Jan 25" part
    const timePart = formatTime(timeStr);

    return `${datePart}, ${timePart}`;
  } catch (err) {
    console.error("DateTime compact format error:", err);
    return "TBA";
  }
}

// ✨ NEW: Normalize datetime for comparison (handles various date formats)
// Returns format: YYYY-MM-DDTHH:mm
export function normalizeDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  try {
    // Robustly extract YYYY-MM-DD without timezone shifting
    let datePart;
    if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      datePart = dateStr.slice(0, 10);
    } else {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      // Use local components to avoid UTC shift
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      datePart = `${year}-${month}-${day}`;
    }

    // timeStr is usually "HH:mm:ss" or "HH:mm"
    const timePart = String(timeStr).slice(0, 5);

    return `${datePart}T${timePart}`;
  } catch (err) {
    console.error("DateTime normalization error:", err);
    return null;
  }
}

// ✨ NEW: Normalize ISO datetime string for comparison
// Returns format: YYYY-MM-DDTHH:mm
export function normalizeIsoDateTime(isoString) {
  if (!isoString) return null;

  try {
    // If it's already a string, check if it contains T or space to extract components
    if (typeof isoString === "string") {
      const parts = isoString.split(/[T ]/);
      if (parts.length >= 2) {
        const datePart = parts[0].slice(0, 10); // YYYY-MM-DD
        const timePart = parts[1].slice(0, 5); // HH:mm
        return `${datePart}T${timePart}`;
      }
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    // Use local components to avoid UTC shift
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${mins}`;
  } catch (err) {
    console.error("ISO DateTime normalization error:", err);
    return null;
  }
}

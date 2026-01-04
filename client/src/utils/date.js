// src/utils/date.js
export function weekLabelFromYearWeek(yearWeek) {
  const year = Number(String(yearWeek).slice(0, 4));
  const week = Number(String(yearWeek).slice(4));
  // ISO week → approximate Monday
  const d = new Date(year, 0, 1 + (week - 1) * 7);
  const monday = new Date(d.setDate(d.getDate() - d.getDay() + 1));
  return `Week of ${monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

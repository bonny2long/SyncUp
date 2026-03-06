import { useTheme } from "../../context/ThemeContext";

/**
 * AG Charts renders on canvas, which cannot resolve CSS var() references.
 * This hook returns concrete color values for chart axes, labels,
 * and gridlines based on the current dark/light mode.
 */
export function useChartTheme() {
  const { isDarkMode } = useTheme();

  return {
    axisLabelColor: isDarkMode ? "#9ca3af" : "#6b7280",
    axisTitleColor: isDarkMode ? "#9ca3af" : "#6b7280",
    gridLineColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    legendLabelColor: isDarkMode ? "#9ca3af" : "#6b7280",
  };
}

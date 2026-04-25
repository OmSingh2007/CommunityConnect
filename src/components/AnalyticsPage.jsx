import React from "react";

export default function AnalyticsPage({ surveys }) {
  const categoryCounts = surveys.reduce((acc, survey) => {
    const cat = survey.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const urgencyCounts = surveys.reduce((acc, survey) => {
    const urg = survey.urgency || "Unknown";
    acc[urg] = (acc[urg] || 0) + 1;
    return acc;
  }, {});

  // Compute total number of surveys for percentage calculations
  const totalSurveys = surveys.length || 1; // avoid division by zero

  // Helper to calculate percentage for a given count
  const percent = (count) => Math.round((count / totalSurveys) * 100);

  // ---------- UI Rendering ----------
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 p-6 transition-colors duration-200">
      {/* Main card container */}
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-md p-8 transition-colors duration-200">
        {/* Header */}
        <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-4">Donor Transparency Report</h1>
        {/* Category Breakdown */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">Needs by Category</h2>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="flex items-center">
                <span className="w-32 text-sm font-medium text-stone-600 dark:text-stone-400" title={category}>{category}</span>
                <div className="flex-1 mx-4 bg-stone-100 dark:bg-stone-700 h-4 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all"
                    style={{ width: `${percent(count)}%` }}
                  ></div>
                </div>
                <span className="w-12 text-sm font-medium text-stone-800 dark:text-stone-200">{count}</span>
              </div>
            ))}
          </div>
        </section>
        {/* Urgency Breakdown */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">Urgency Levels</h2>
          <div className="space-y-4">
            {Object.entries(urgencyCounts).map(([urgency, count]) => {
              // Choose a color based on urgency
              const colorMap = {
                Critical: "bg-rose-600 dark:bg-rose-500",
                High: "bg-orange-500 dark:bg-orange-400",
                Medium: "bg-amber-400 dark:bg-amber-500",
                Low: "bg-green-500 dark:bg-green-400",
                Unknown: "bg-stone-400 dark:bg-stone-500",
              };
              const barColor = colorMap[urgency] || "bg-stone-400 dark:bg-stone-500";
              return (
                <div key={urgency} className="flex items-center">
                  <span className="w-32 text-sm font-medium text-stone-600 dark:text-stone-400" title={urgency}>{urgency}</span>
                  <div className="flex-1 mx-4 bg-stone-100 dark:bg-stone-700 h-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${percent(count)}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm font-medium text-stone-800 dark:text-stone-200">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

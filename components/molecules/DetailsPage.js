'use client';

import React from 'react'; 
export default function DetailsPage({
  title,
  subtitle,
  subtitleColor = "text-gray-600",
  timeline = [],
  infoSections = [],
  logEntries = [],
  logTitle = "NOTES / UPDATES LOG",
  actions = [],
  showTimeline = true,
  showInfoSections = true,
  showLog = true,
  showActions = true,
  onBack,
}) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {subtitle && (
                <p className={`text-sm font-medium ${subtitleColor}`}>
                  {subtitle}
                </p>
              )}
            </div>
            {/* {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Back
              </button>
            )} */}
          </div>
        </div>

        {/* Timeline Section */}
        {showTimeline && timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Status Timeline
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {timeline.map((item, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      item.active
                        ? 'bg-blue-500 text-white'
                        : item.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.label}
                  </div>
                  {index < timeline.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Information Sections Grid */}
        {showInfoSections && infoSections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {infoSections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">
                        {item.label}
                      </span>
                      <span className={`text-sm font-medium ${item.className || 'text-gray-900'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Optional table for components or sub-items */}
                {section.table && (
                  <div className="mt-4 border-t pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {section.table.headers.map((header, idx) => (
                            <th
                              key={idx}
                              className="text-left py-2 text-xs font-semibold text-gray-600"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="border-b last:border-0">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="py-2 text-gray-700">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Log Section */}
        {showLog && logEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              {logTitle}
            </h2>
            <div className="space-y-3">
              {logEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  <span className="text-xs text-gray-500 min-w-[80px]">
                    {entry.time}
                  </span>
                  <span className="text-sm text-gray-700">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && actions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                      : action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                      : action.variant === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

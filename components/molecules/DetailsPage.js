'use client';

import React from 'react'; 

export default function DetailsPage({
  title,
  subtitle,
  subtitleColor = "text-gray-600",
  leftSections = [],
  rightSections = [],
  onBack,
  headerActions,
}) {
  const renderSection = (section, index) => {
    return (
      <div
        key={index}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
      >
        {section.title && (
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            {section.title}
          </h2>
        )}
        
        {/* Render items if present */}
        {section.items && section.items.length > 0 && (
          <div className={section.itemsGrid ? "grid grid-cols-2 gap-x-4 gap-y-3" : "space-y-3"}>
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
        )}

        {/* Render table if present */}
        {section.table && (
          <div className={section.items && section.items.length > 0 ? "mt-4 border-t pt-4" : ""}>
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

        {/* Render timeline if present */}
        {section.timeline && section.timeline.length > 0 && (
          <div className="flex flex-col gap-2">
            {section.timeline.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded text-sm font-medium w-full text-center ${
                      item.active
                        ? 'bg-blue-500 text-white'
                        : item.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.label}
                  </div>
                </div>
                {idx < section.timeline.length - 1 && (
                  <div className="flex justify-center">
                    <span className="text-gray-400">↓</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Render log entries if present */}
        {section.logEntries && section.logEntries.length > 0 && (
          <div className="space-y-3">
            {section.logEntries.map((entry, idx) => (
              <div
                key={idx}
                className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
              >
                <span className="text-xs text-gray-500 min-w-20">
                  {entry.time}
                </span>
                <span className="text-sm text-gray-700">{entry.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Render action buttons if present */}
        {section.actions && section.actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {section.actions.map((action, idx) => (
              <button
                key={idx}
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
        )}

        {/* Render custom content if present */}
        {section.content && (
          <div>{section.content}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
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
            {headerActions && (
              <div className="flex gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* 30-70% Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - 30% */}
          {leftSections.length > 0 && (
            <div className="w-full lg:w-[30%] space-y-6">
              {leftSections.map((section, index) => renderSection(section, index))}
            </div>
          )}

          {/* Right Column - 70% */}
          {rightSections.length > 0 && (
            <div className="w-full lg:w-[70%] space-y-6">
              {rightSections.map((section, index) => renderSection(section, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

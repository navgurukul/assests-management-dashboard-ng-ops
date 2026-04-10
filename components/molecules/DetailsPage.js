'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';

const ACCENT_COLORS = {
  blue:   { border: 'border-t-blue-500',   titleBg: 'bg-blue-50',   titleText: 'text-blue-700'   },
  green:  { border: 'border-t-green-500',  titleBg: 'bg-green-50',  titleText: 'text-green-700'  },
  purple: { border: 'border-t-purple-500', titleBg: 'bg-purple-50', titleText: 'text-purple-700' },
  orange: { border: 'border-t-orange-500', titleBg: 'bg-orange-50', titleText: 'text-orange-700' },
  teal:   { border: 'border-t-teal-500',   titleBg: 'bg-teal-50',   titleText: 'text-teal-700'   },
  red:    { border: 'border-t-red-500',    titleBg: 'bg-red-50',    titleText: 'text-red-700'    },
  indigo: { border: 'border-t-indigo-500', titleBg: 'bg-indigo-50', titleText: 'text-indigo-700' },
  gray:   { border: 'border-t-gray-400',   titleBg: 'bg-gray-50',   titleText: 'text-gray-600'   },
  theme:  { border: 'border-b-[#6B6158] border-t-[#9C958E]', titleBg: 'bg-[#9C958E]', titleText: 'text-white' },
};

export default function DetailsPage({
  title,
  subtitle,
  subtitleColor = 'text-gray-600',
  leftSections = [],
  rightSections = [],
  rightGrid = false,
  onBack,
  headerActions,
}) {
  const renderSection = (section, index) => {
    const accent = ACCENT_COLORS[section.color] || ACCENT_COLORS.gray;
    const spanClass = rightGrid && section.span === 2 ? 'lg:col-span-2' : '';

    return (
      <div
        key={index}
        className={`bg-[var(--surface)] rounded-lg shadow-sm border border-[var(--border)] flex flex-col ${spanClass} ${section.className || ''}`}
      >
        {section.title && (
          <div className={`px-4 py-3 rounded-t-lg flex flex-wrap items-center justify-between gap-2 ${accent.titleBg} ${accent.border}`}>
            <h2 className={`text-[11px] font-bold uppercase tracking-widest ${accent.titleText}`}>
              {section.title}
            </h2>
            {section.headerActions && section.headerActions.length > 0 && (
              <div className="flex items-center gap-2">
                {section.headerActions.map((action, idx) => (
                  <CustomButton
                    key={idx}
                    text={action.label}
                    variant={action.variant || 'primary'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {/* Render items if present */}
          {section.items && section.items.length > 0 && (
            <div className={section.itemsGrid ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4' : 'space-y-4'}>
              {section.items.map((item, itemIndex) => {
                const isFullWidth =
                  item.span === 2 ||
                  item.className?.includes('col-span-2') ||
                  item.className?.includes('col-span-full');
                const rawClass = item.className?.replace(/col-span-\S+/g, '').trim() || '';
                const textClass = rawClass || 'text-gray-800';
                return (
                  <div
                    key={itemIndex}
                    className={`flex flex-col gap-0.5 ${isFullWidth && section.itemsGrid ? 'sm:col-span-2' : ''}`}
                  >
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {item.label}
                    </span>
                    <span className={`text-xs sm:text-sm font-medium leading-snug ${textClass}`} title={item.title}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Render table if present */}
          {section.table && (
            <div className={section.items && section.items.length > 0 ? 'mt-5 border-t border-gray-100 pt-4' : ''}>
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {section.table.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className="text-left py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700">
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
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold w-full text-center ${
                      item.active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : item.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.label}
                  </div>
                </div>
                {idx < section.timeline.length - 1 && (
                  <div className="flex justify-center text-gray-300 text-sm">↓</div>
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
                  className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <span className="text-[10px] sm:text-xs text-gray-400 min-w-16 sm:min-w-20 pt-0.5">
                    {entry.time}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-700">{entry.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Render action buttons if present */}
          {section.actions && section.actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {section.actions.map((action, idx) => (
                <CustomButton
                  key={idx}
                  text={action.label}
                  variant={action.variant || 'primary'}
                  size="md"
                  onClick={action.onClick}
                  disabled={action.disabled}
                />
              ))}
            </div>
          )}

          {/* Render custom content if present */}
          {section.content && (
            <div>{section.content}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--background)] p-3 sm:p-5">
      {/* Back Button */}
      {onBack && (
        <div className="mb-4 shrink-0">
          <CustomButton
            text="Back"
            icon={ArrowLeft}
            onClick={onBack}
            variant="secondary"
            size="sm"
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-[var(--surface)] rounded-lg shadow-sm px-4 sm:px-7 py-4 sm:py-5 mb-5 border border-[var(--border)] shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && (
              <p className={`text-xs sm:text-sm mt-1 font-medium ${subtitleColor}`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex gap-2 items-center shrink-0 flex-wrap">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* 30-70% Split Layout */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Left Column - 30% */}
        {leftSections.length > 0 && (
          <div className="w-full lg:w-[30%] lg:overflow-y-auto space-y-4 pr-1">
            {leftSections.map((section, index) => renderSection(section, index))}
          </div>
        )}

        {/* Right Column - 70% */}
        {rightSections.length > 0 && (
          <div className={`w-full lg:w-[70%] lg:overflow-y-auto pr-1 ${rightGrid ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 content-start' : 'space-y-4'}`}>
            {rightSections.map((section, index) => renderSection(section, index))}
          </div>
        )}
      </div>
    </div>
  );
}

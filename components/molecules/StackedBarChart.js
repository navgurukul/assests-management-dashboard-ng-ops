'use client';

import React from 'react';
import { Chart } from 'react-google-charts';
import { useTheme } from '@/app/context/ThemeContext';
import { getThemeCssColor } from '@/app/utils/themeColor';

const StackedBarChart = ({ 
  data, 
  title = "Bar Chart", 
  width = "100%", 
  height = "500px",
  colors = ['#60A5FA', '#93C5FD', '#FCA5A5', '#FCD34D', '#FB923C'],
  hAxisTitle = "",
  vAxisTitle = ""
}) => {
  const { theme } = useTheme();
  const foreground = getThemeCssColor(
    theme === 'dark' ? '--foreground-dark' : '--foreground-light',
    theme === 'dark' ? '#f3f4f6' : '#111827'
  );

  const options = {
    title: title,
    titleTextStyle: {
      fontSize: 18,
      bold: true,
      color: foreground,
      fontName: 'Poppins'
    },
    chartArea: { 
      width: '60%',
      height: '70%'
    },
    isStacked: true,
    colors: colors,
    hAxis: {
      title: hAxisTitle,
      minValue: 0,
      textStyle: {
        color: foreground,
        fontName: 'Poppins',
        fontSize: 12
      },
      titleTextStyle: {
        color: foreground,
        fontName: 'Poppins',
        fontSize: 14,
        bold: true,
        italic: true
      }
    },
    vAxis: {
      title: vAxisTitle,
      textStyle: {
        color: foreground,
        fontName: 'Poppins',
        fontSize: 12
      },
      titleTextStyle: {
        color: foreground,
        fontName: 'Poppins',
        fontSize: 14,
        bold: true,
        italic: true
      }
    },
    legend: {
      position: 'right',
      alignment: 'center',
      textStyle: {
        color: foreground,
        fontName: 'Poppins',
        fontSize: 12
      }
    },
    backgroundColor: 'transparent',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Chart
        key={theme}
        chartType="BarChart"
        data={data}
        options={options}
        width={width}
        height={height}
      />
    </div>
  );
};

export default StackedBarChart;

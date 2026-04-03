'use client';

import React from 'react';
import { Chart } from 'react-google-charts';
import { useTheme } from '@/app/context/ThemeContext';
import { getThemeCssColor } from '@/app/utils/themeColor';

const PieChart = ({ 
  data, 
  title = "Pie Chart", 
  width = "100%", 
  height = "350px",
  colors = ['#93C5FD', '#5EEAD4'],
  showLegend = true,
  legendPosition = 'right'
}) => {
  const { theme } = useTheme();
  const foreground = getThemeCssColor('--foreground');

  const options = {
    title: title,
    titleTextStyle: {
      fontSize: 18,
      bold: true,
      color: foreground,
      fontName: 'Poppins'
    },
    colors: colors,
    legend: {
      position: legendPosition,
      alignment: 'center',
      textStyle: {
        fontSize: 14,
        color: foreground,
        fontName: 'Poppins'
      }
    },
    pieSliceText: 'value',
    pieSliceTextStyle: {
      color: 'white',
      fontSize: 14,
      fontName: 'Poppins'
    },
    chartArea: {
      width: '90%',
      height: '80%'
    },
    backgroundColor: 'transparent',
    is3D: false,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Chart
        key={theme}
        chartType="PieChart"
        data={data}
        options={options}
        width={width}
        height={height}
      />
    </div>
  );
};

export default PieChart;

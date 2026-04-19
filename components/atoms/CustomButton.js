import React from 'react';


export default function CustomButton({ 
  text, 
  icon: Icon, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  // When true, the button automatically bumps up one size on mobile screens
  responsive = true,
  ...rest
}) {
  
  // Variant styles with professional color palette - Modern tinted style
  const variantStyles = {
    primary: 'bg-[#dbeafe] text-[#2563eb] hover:bg-[#bfdbfe] border-[#2563eb] border-2',
    secondary: 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] border-[#64748b] border-2',
    danger: 'bg-[#fee2e2] text-[#ef4444] hover:bg-[#fecaca] border-[#ef4444] border-2',
    warning: 'bg-[#fef3c7] text-[#f59e0b] hover:bg-[#fde68a] border-[#f59e0b] border-2',
    success: 'bg-[#d1fae5] text-[#10b981] hover:bg-[#a7f3d0] border-[#10b981] border-2',
    info: 'bg-[#dbeafe] text-[#3b82f6] hover:bg-[#bfdbfe] border-[#3b82f6] border-2',
    neutral: 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] border-[#6b7280] border-2',
    purple: 'bg-[#ede9fe] text-[#8b5cf6] hover:bg-[#ddd6fe] border-[#8b5cf6] border-2',
    disabled: 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed border-[#d1d5db] border-2',
  };

  // Fixed size styles (no responsive scaling)
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Responsive size styles: gradually scales across breakpoints (mobile → sm → md → lg)
  const responsiveSizeStyles = {
    sm: 'px-2 py-0.5 text-xs sm:px-2 sm:py-1 sm:text-xs md:px-2 md:py-1 md:text-xs',
    md: 'px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-sm lg:px-4 lg:py-2 lg:text-base',
    lg: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base md:px-5 md:py-2.5 md:text-base lg:px-5 lg:py-2.5 lg:text-lg',
  };

  // Fixed icon sizes
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Responsive icon sizes: scale alongside button across breakpoints
  const responsiveIconSizes = {
    sm: 'w-3 h-3 sm:w-3 sm:h-3 md:w-3 md:h-3',
    md: 'w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5',
    lg: 'w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6',
  };

  // Default padding/text size classes
  const defaultBtnClasses = 'px-2! py-0.5! text-xs! sm:px-3! sm:py-1.5! sm:text-sm!';
  const resolvedSizeStyle = responsive ? responsiveSizeStyles[size] : sizeStyles[size];
  const resolvedIconSize = responsive ? responsiveIconSizes[size] : iconSizes[size];

  const buttonClasses = `
    flex items-center gap-1 sm:gap-1.5
    rounded-lg font-semibold 
    transition-all duration-200
    shadow-sm hover:shadow-md
    whitespace-nowrap
    ${disabled ? variantStyles.disabled : variantStyles[variant]}
    ${defaultBtnClasses}
    ${resolvedSizeStyle}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={buttonClasses}
      {...rest}
    >
      {Icon && <Icon className={resolvedIconSize} />}
      {text}
    </button>
  );
}

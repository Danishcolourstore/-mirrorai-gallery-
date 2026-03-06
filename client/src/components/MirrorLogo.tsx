interface MirrorLogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
  textClassName?: string;
  className?: string;
}

export function MirrorEyeSymbol({ size = 40, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.45}
      viewBox="0 0 200 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left eye/leaf */}
      <path
        d="M100 45 C85 10, 40 0, 10 45 C40 90, 85 80, 100 45Z"
        fill={color}
      />
      <path
        d="M100 45 C85 25, 55 18, 30 45 C55 72, 85 65, 100 45Z"
        fill="none"
        stroke={color === 'currentColor' ? 'var(--eye-cutout, hsl(0 0% 98%))' : color === 'hsl(var(--sidebar-primary))' ? 'hsl(var(--sidebar-background))' : 'hsl(var(--background))'}
        strokeWidth="0"
      />
      <ellipse cx="55" cy="45" rx="22" ry="18" fill={color === 'currentColor' ? 'hsl(var(--background))' : color === 'hsl(var(--sidebar-primary))' ? 'hsl(var(--sidebar-background))' : 'hsl(var(--background))'} />
      {/* Right eye/leaf */}
      <path
        d="M100 45 C115 10, 160 0, 190 45 C160 90, 115 80, 100 45Z"
        fill={color}
      />
      <ellipse cx="145" cy="45" rx="22" ry="18" fill={color === 'currentColor' ? 'hsl(var(--background))' : color === 'hsl(var(--sidebar-primary))' ? 'hsl(var(--sidebar-background))' : 'hsl(var(--background))'} />
    </svg>
  );
}

export function MirrorLogo({ size = 40, color = 'currentColor', showText = true, textClassName = '', className = '' }: MirrorLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <MirrorEyeSymbol size={size} color={color} />
      {showText && (
        <span className={`font-sans text-[10px] font-medium uppercase tracking-[0.3em] mt-1.5 ${textClassName}`} style={{ color: color === 'currentColor' ? undefined : color }}>
          Mirror
        </span>
      )}
    </div>
  );
}

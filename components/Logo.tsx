type LogoSize = 'sm' | 'md' | 'lg'

type LogoProps = {
  size?: LogoSize
  compact?: boolean
  className?: string
}

const configs: Record<LogoSize, { lineWidth: string; textSize: string; gap: string }> = {
  sm: { lineWidth: 'w-[18px]', textSize: 'text-[9px]',  gap: 'gap-[5px]' },
  md: { lineWidth: 'w-[22px]', textSize: 'text-[10px]', gap: 'gap-[6px]' },
  lg: { lineWidth: 'w-[28px]', textSize: 'text-[11px]', gap: 'gap-[7px]' },
}

export function Logo({ size = 'md', compact = false, className = '' }: LogoProps) {
  const { lineWidth, textSize, gap } = configs[size]
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      <div
        className={`${lineWidth} h-px`}
        style={{ background: 'var(--quiet-primary)' }}
      />
      <span
        className={`${textSize} font-light uppercase tracking-[0.2em]`}
        style={{ color: 'var(--quiet-foreground)', letterSpacing: '0.18em' }}
      >
        {compact ? 'qm' : 'quiet mode'}
      </span>
    </div>
  )
}

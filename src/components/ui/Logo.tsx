interface Props {
  className?: string
}

export function Logo({ className = 'h-8' }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-gradient-tagatech flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">TL</span>
      </div>
      <span className="font-bold text-white text-lg">TagaLinks</span>
    </div>
  )
}

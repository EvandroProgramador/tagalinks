interface Props {
  className?: string
}

export function Logo({ className = 'h-48' }: Props) {
  return (
    <img
      src="/images/tagarela_sem_fundo.png"
      alt="TagaLinks"
      className={className}
    />
  )
}

import { cn } from '@/lib/utils'

interface Props {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: Props) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-2xl' }
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (src) {
    return (
      <img src={src} alt={name || 'Avatar'}
           className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)} />
    )
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white bg-gradient-tagatech', sizes[size], className)}>
      {initials}
    </div>
  )
}

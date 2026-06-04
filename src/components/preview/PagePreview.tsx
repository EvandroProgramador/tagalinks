import { useEditorStore } from '@/store/useEditorStore'
import { useAuth } from '@/hooks/useAuth'
import { PublicPage } from './PublicPage'
import { Smartphone } from 'lucide-react'

export function PagePreview() {
  const { page, items } = useEditorStore()
  const { plan }        = useAuth()

  if (!page) return null

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Smartphone className="w-3.5 h-3.5" />
        Preview mobile
      </div>
      <div className="w-72 h-[580px] rounded-[2rem] border-4 border-surface-elevated bg-surface-bg overflow-hidden shadow-2xl">
        <div className="w-full h-full overflow-y-auto">
          <PublicPage page={page} items={items} plan={plan} preview />
        </div>
      </div>
    </div>
  )
}

import { create } from 'zustand'
import type { LinkPage, LinkItem } from '@/types'

interface EditorState {
  page:         LinkPage | null
  items:        LinkItem[]
  dirty:        boolean
  preview:      boolean
  saving:       boolean
  setPage:      (p: LinkPage) => void
  setItems:     (items: LinkItem[]) => void
  updateItem:   (id: string, data: Partial<LinkItem>) => void
  removeItem:   (id: string) => void
  reorderItems: (items: LinkItem[]) => void
  setDirty:     (d: boolean) => void
  setPreview:   (p: boolean) => void
  setSaving:    (s: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  page:    null,
  items:   [],
  dirty:   false,
  preview: false,
  saving:  false,

  setPage:  (page)  => set({ page }),
  setItems: (items) => set({ items }),

  updateItem: (id, data) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
      dirty: true,
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id), dirty: true })),

  reorderItems: (items) => set({ items, dirty: true }),
  setDirty:     (dirty)   => set({ dirty }),
  setPreview:   (preview) => set({ preview }),
  setSaving:    (saving)  => set({ saving }),
}))

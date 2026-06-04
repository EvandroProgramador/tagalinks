import { getYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  url:       string
  title?:    string
  autoplay?: boolean
  className?: string
}

export function YouTubeEmbed({ url, title, autoplay = false, className = '' }: Props) {
  const [playing, setPlaying] = useState(autoplay)
  const id        = getYouTubeId(url)
  const embedUrl  = getYouTubeEmbedUrl(url)
  const thumbnail = getYouTubeThumbnail(url)

  if (!id || !embedUrl) return null

  if (!playing) {
    return (
      <div
        className={`relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group ${className}`}
        onClick={() => setPlaying(true)}
      >
        {thumbnail && (
          <img src={thumbnail} alt={title || 'Vídeo'} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-0.5" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-3">
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-full aspect-video rounded-xl overflow-hidden ${className}`}>
      <iframe
        src={`${embedUrl}&autoplay=1`}
        title={title || 'Vídeo'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}

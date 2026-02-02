'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption: string | null
  sort_order: number
}

export default function PropertyPhotos({ propertyId }: { propertyId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
  }, [propertyId])

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/photos`)
      const data = await res.json()
      setPhotos(data.photos || [])
    } catch (err) {
      console.error('Failed to fetch photos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch(`/api/properties/${propertyId}/photos`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()
        setPhotos(prev => [...prev, data.photo])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        break
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return

    try {
      const res = await fetch(`/api/properties/${propertyId}/photos?photoId=${photoId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
        <label className="cursor-pointer bg-[#3d3530] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#3d3530]/90 transition-colors inline-flex items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Photos
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p>No photos yet</p>
            <p className="text-sm">Upload photos to showcase this property</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photo.url}
                alt={photo.caption || 'Property photo'}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useRef, useState } from 'react'

interface CameraCaptureProps {
  onImageCapture: (base64: string) => void
  loading: boolean
}

export default function CameraCapture({ onImageCapture, loading }: CameraCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      onImageCapture(result)
    }
    reader.readAsDataURL(file)
  }

  function handleCamera() {
    fileRef.current?.click()
  }

  return (
    <div className="camera-capture">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        hidden
      />

      {!preview ? (
        <div className="upload-area">
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <p className="upload-text">Foto struk belanja</p>
          <p className="upload-sub">Atau upload dari galeri</p>
          <button className="btn btn-primary" onClick={handleCamera} disabled={loading}>
            {loading ? 'Memproses...' : 'Ambil Foto'}
          </button>
        </div>
      ) : (
        <div className="preview-area">
          <div className="preview-img-wrap">
            <img src={preview} alt="Struk" className={`preview-img ${loading ? 'preview-dimmed' : ''}`} />
            {loading && (
              <div className="preview-loading-overlay">
                <div className="spinner" />
                <p className="preview-loading-text">AI sedang membaca struk...</p>
              </div>
            )}
          </div>
          <button className="btn btn-outline" onClick={() => { setPreview(null); onImageCapture('') }} disabled={loading}>
            Foto Ulang
          </button>
        </div>
      )}
    </div>
  )
}

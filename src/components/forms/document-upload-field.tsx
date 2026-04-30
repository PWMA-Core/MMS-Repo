import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DOCUMENT_ACCEPT_ATTRIBUTE,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@/lib/constants/documents'
import {
  formatFileSize,
  isAllowedDocumentMime,
  isAllowedDocumentSize,
} from '@/lib/validators/documents'

interface Props {
  value: File | null
  onChange: (file: File | null) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function DocumentUploadField({
  value,
  onChange,
  label = 'Upload file',
  description = 'PDF preferred. Excel, Word, PNG, JPEG accepted. Max 5 MB.',
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    setError(null)
    if (!file) {
      onChange(null)
      return
    }
    if (!isAllowedDocumentSize(file.size)) {
      setError(
        `File is ${formatFileSize(file.size)}; limit ${formatFileSize(MAX_DOCUMENT_SIZE_BYTES)}`,
      )
      return
    }
    if (!isAllowedDocumentMime(file.type)) {
      setError('File type not allowed. Use PDF, Excel, Word, PNG, or JPEG.')
      return
    }
    onChange(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              onChange(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            disabled={disabled}
          >
            <X className="mr-1 h-3 w-3" />
            Remove
          </Button>
        )}
      </div>
      <div className="border-muted-foreground/40 rounded-md border border-dashed p-4">
        {value ? (
          <div className="flex items-center justify-between text-sm">
            <div className="truncate">
              <p className="truncate font-medium">{value.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatFileSize(value.size)} · {value.type || 'unknown type'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose file
            </Button>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={DOCUMENT_ACCEPT_ATTRIBUTE}
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

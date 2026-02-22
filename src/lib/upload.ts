/**
 * Image upload utilities for Vercel Blob storage
 */

export interface UploadResponse {
  url: string
  filename: string
  size: number
  type: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

// Constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns ValidationResult with valid status and optional error message
 */
export function validateImage(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF.',
    }
  }

  return { valid: true }
}

/**
 * Upload image file to Vercel Blob storage
 * @param file - Image file to upload
 * @param folder - Optional folder path (default: 'campaigns')
 * @returns Promise with upload response
 */
export async function uploadImage(file: File, folder: string = 'campaigns'): Promise<UploadResponse> {
  const validation = validateImage(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Upload failed')
  }

  return data.data
}

/**
 * Delete image from Vercel Blob storage
 * @param imageId - Image ID or blob pathname to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteImage(imageId: string): Promise<void> {
  const response = await fetch(`/api/upload/${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Deletion failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Deletion failed')
  }
}

/**
 * Get public URL for an uploaded image
 * @param imagePath - Path or URL of the image in blob storage
 * @returns Public URL string
 */
export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  if (imagePath.startsWith('/')) {
    return imagePath
  }
  return `/api/upload/${imagePath}`
}

/**
 * Generate thumbnail URL using Vercel Image Optimization
 * Requires the image to be a valid public URL
 * @param imageUrl - Full URL of the image
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels
 * @returns URL with image optimization parameters
 */
export function generateThumbnail(imageUrl: string, width: number, height: number): string {
  if (!imageUrl.startsWith('http')) {
    return imageUrl
  }

  try {
    const url = new URL('/_next/image', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    url.searchParams.set('url', imageUrl)
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', '75')
    return url.toString()
  } catch {
    return imageUrl
  }
}

/**
 * Get optimized image URL with specified dimensions
 * @param imageUrl - Full URL of the image
 * @param width - Desired width in pixels
 * @param height - Optional desired height in pixels
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl: string, width: number, height?: number): string {
  return generateThumbnail(imageUrl, width, height || width)
}

/**
 * Extract blob pathname from Vercel Blob URL
 * @param blobUrl - Full Vercel Blob URL
 * @returns Pathname for use with delete operations
 */
export function extractBlobPathname(blobUrl: string): string {
  try {
    const url = new URL(blobUrl)
    return decodeURIComponent(url.pathname.slice(1)) // Remove leading slash
  } catch {
    return blobUrl
  }
}

// constants/images.ts
export const DEFAULT_AVATAR = 'https://picsum.photos/150?random=1'
export const DEFAULT_POST_IMAGE = 'https://picsum.photos/600?random=101'

// Проверка и валидация URL
export function validateImageUrl(url: string | undefined | null): string {
  if (!url) return DEFAULT_AVATAR
  
  // Если URL уже содержит полный адрес
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Проверяем, что это правильный домен picsum
    if (url.includes('picsum.photos')) {
      return url
    }
    return url
  }
  
  // Если URL начинается с picsum (без протокола)
  if (url.startsWith('picsum')) {
    return `https://${url}`
  }
  
  // Если это относительный путь
  return DEFAULT_AVATAR
}
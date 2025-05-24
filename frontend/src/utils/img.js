// utils/img.js
export const fullSrc  = (base, url) => url
  ? `${base}/uploads/${url.split('/').pop()}`
  : '';

export const thumbSrc = (base, url) => url
  ? `${base}/uploads/thumb_${url.split('/').pop()}`
  : '';

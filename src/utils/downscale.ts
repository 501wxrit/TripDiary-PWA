export async function downscale(file: File, maxW = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const mime = file.type.includes('png') ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, quality));
  return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: mime });
}

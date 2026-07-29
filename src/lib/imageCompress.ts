export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number; type?: string } = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.8, type = 'image/jpeg' } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas blob creation failed'));
          resolve({ blob, width, height });
        },
        type,
        quality
      );
    };
    img.onerror = () => reject(new Error('Image loading failed'));
  });
}

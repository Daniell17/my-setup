export type ExportFormat = 'png' | 'jpeg' | 'webp';

export async function captureHighQualityScreenshot(
  format: ExportFormat,
  width: number,
  height: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      reject(new Error('Canvas not found'));
      return;
    }

    // Create a new canvas with desired resolution
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get 2D context'));
      return;
    }

    // Scale and draw the original canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, width, height);

    // Convert to desired format
    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const dataUrl = exportCanvas.toDataURL(mimeType, quality);
    resolve(dataUrl);
  });
}

export async function generateThumbnail(
  width: number = 400,
  height: number = 300
): Promise<string> {
  try {
    const dataUrl = await captureHighQualityScreenshot('png', width, height, 0.9);
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return '';
  }
}


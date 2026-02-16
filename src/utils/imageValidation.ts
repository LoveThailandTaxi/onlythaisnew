export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}

export async function validateSquareImage(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({
        isValid: false,
        error: 'Please select an image file',
      });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;

      if (width !== height) {
        resolve({
          isValid: false,
          error: `Image must be square (1:1 aspect ratio). Your image is ${width}x${height}px. Please crop it to a square format before uploading.`,
          dimensions: { width, height },
        });
      } else {
        resolve({
          isValid: true,
          dimensions: { width, height },
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Failed to load image. Please try a different file.',
      });
    };

    img.src = url;
  });
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

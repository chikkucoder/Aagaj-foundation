import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';

/**
 * Generates an instant high-resolution QR Code Data URL locally without any network request.
 * @param {string} text - Data string to encode in QR
 * @returns {Promise<string>} - Base64 Data URL of the QR code
 */
export const generateQrCodeDataUrl = async (text) => {
  if (!text) return '';
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      color: {
        dark: '#2e3192',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    return dataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
};

/**
 * Resolves any relative or absolute asset URL to a full accessible URL.
 * @param {string} assetPath 
 * @returns {string}
 */
export const resolveAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  const normalized = String(assetPath).replace(/\\/g, '/');
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (normalized.startsWith('/')) {
    return `${baseUrl}${normalized}`;
  }
  return `${baseUrl}/${normalized}`;
};

/**
 * Converts an image URL (Cloudinary / Local / Server) to a safe Base64 Data URL.
 * Ensures the canvas is NEVER tainted during html2canvas capture.
 * @param {string} src - The image URL
 * @param {string} fallbackSrc - Default image fallback
 * @returns {Promise<string>} - Base64 Data URL
 */
export const imageUrlToBase64 = async (src, fallbackSrc = '/logo.jpg') => {
  if (!src) return fallbackSrc;
  if (src.startsWith('data:image/')) return src;

  // 1. Try direct fetch with blob conversion
  try {
    const response = await fetch(src, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(fallbackSrc);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    // Fetch failed, proceed to image element fallback
  }

  // 2. Try Image object drawing to Canvas
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch (canvasErr) {
          resolve(fallbackSrc);
        }
      };
      img.onerror = () => resolve(fallbackSrc);
      img.src = src;
    });
  } catch (err) {
    return fallbackSrc;
  }
};

/**
 * Robustly renders a DOM element to canvas avoiding CSS transform / scaling glitches on mobile.
 * @param {HTMLElement} element 
 * @returns {Promise<HTMLCanvasElement>}
 */
export const renderElementToCanvas = async (element) => {
  if (!element) throw new Error('Target element not found');

  // Clone node into a clean off-screen sandbox container without any transforms or negative margins
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-9999px';
  sandbox.style.top = '0';
  sandbox.style.width = `${element.offsetWidth || 550}px`;
  sandbox.style.zIndex = '-9999';
  sandbox.style.transform = 'none';
  sandbox.style.margin = '0';
  sandbox.style.padding = '0';
  sandbox.style.background = '#ffffff';

  const clone = element.cloneNode(true);
  // Remove any CSS transforms from clone
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.maxWidth = 'none';
  clone.style.width = '550px';

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // Allow fonts/images in cloned DOM to settle
    await new Promise((resolve) => setTimeout(resolve, 80));

    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
      scrollX: 0,
      scrollY: 0
    });

    return canvas;
  } finally {
    if (document.body.contains(sandbox)) {
      document.body.removeChild(sandbox);
    }
  }
};

/**
 * Downloads or natively shares a canvas on both desktop and mobile devices.
 * @param {HTMLCanvasElement} canvas 
 * @param {string} filename 
 * @returns {Promise<boolean>}
 */
export const saveOrShareCanvas = async (canvas, filename) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        // Fallback to dataURL if toBlob fails
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 800);
          resolve(true);
        } catch (e) {
          reject(e);
        }
        return;
      }

      const file = new File([blob], filename, { type: 'image/png' });

      // If mobile supports Web Share API with files, prompt direct share/save
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: filename,
            text: 'Aagaj Foundation - Swasthya Suraksha Health Card'
          });
          resolve(true);
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            resolve(false);
            return;
          }
          // If share failed for other reason, proceed to standard download
        }
      }

      // Standard Blob download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 1500);

      resolve(true);
    }, 'image/png', 0.98);
  });
};

/**
 * Combines Front and Back Card elements into a single high-definition PNG file.
 * @param {HTMLElement} frontElement 
 * @param {HTMLElement} backElement 
 * @param {string} filename 
 */
export const downloadCombinedCardImage = async (frontElement, backElement, filename) => {
  if (!frontElement || !backElement) throw new Error('Both card sides are required');

  const [frontCanvas, backCanvas] = await Promise.all([
    renderElementToCanvas(frontElement),
    renderElementToCanvas(backElement)
  ]);

  const gap = 30;
  const padding = 30;
  const width = Math.max(frontCanvas.width, backCanvas.width) + padding * 2;
  const height = frontCanvas.height + backCanvas.height + gap + padding * 2;

  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = width;
  combinedCanvas.height = height;
  const ctx = combinedCanvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Draw Front
  const frontX = (width - frontCanvas.width) / 2;
  ctx.drawImage(frontCanvas, frontX, padding);

  // Draw Back
  const backX = (width - backCanvas.width) / 2;
  ctx.drawImage(backCanvas, backX, padding + frontCanvas.height + gap);

  await saveOrShareCanvas(combinedCanvas, filename);
};

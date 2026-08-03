export interface BannerOptions {
  title: string;
  company: string;
  location?: string;
  country?: string;
  salary?: string | null;
  closingDate?: string;
  medium?: string;
  isGovernment?: boolean;
  isOverseas?: boolean;
  isPrivateSector?: boolean;
}

/**
 * Generates a high-resolution (1200x630), copyright-safe, modern branded Job Banner image (data URL)
 * using HTML5 Canvas. Perfect for social media auto-posting on Facebook Page, WhatsApp Channel, and Website thumbnails.
 */
export function generateJobBanner(options: BannerOptions): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 1. Background Gradient (Sleek Dark Slate & Royal Blue theme)
  const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGradient.addColorStop(0, '#0f172a'); // slate-900
  bgGradient.addColorStop(0.6, '#1e293b'); // slate-800
  bgGradient.addColorStop(1, '#1e3a8a'); // blue-900
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Decorative Accent Blobs
  ctx.fillStyle = 'rgba(37, 99, 235, 0.15)'; // blue-600 with opacity
  ctx.beginPath();
  ctx.arc(1100, 100, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)'; // amber-500 with opacity
  ctx.beginPath();
  ctx.arc(100, 550, 250, 0, Math.PI * 2);
  ctx.fill();

  // 2. Top Header Brand Bar (JobNews.lk)
  ctx.fillStyle = '#2563eb'; // blue-600
  ctx.beginPath();
  ctx.roundRect(60, 50, 220, 48, 10);
  ctx.fill();

  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('JobNews.lk', 85, 83);

  // Sector / Category Badge
  let badgeText = 'JOB VACANCY';
  let badgeBg = '#475569'; // slate-600

  if (options.isGovernment) {
    badgeText = 'GOVERNMENT VACANCY';
    badgeBg = '#2563eb'; // blue-600
  } else if (options.isOverseas) {
    badgeText = `OVERSEAS VACANCY (${(options.country || 'INTERNATIONAL').toUpperCase()})`;
    badgeBg = '#0d9488'; // teal-600
  } else if (options.isPrivateSector) {
    badgeText = 'PRIVATE SECTOR VACANCY';
    badgeBg = '#d97706'; // amber-600
  }

  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(300, 50, ctx.measureText(badgeText).width + 30, 48, 10);
  ctx.fill();

  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badgeText, 315, 81);

  // 3. Company Name
  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8'; // slate-400
  const companyText = (options.company || 'ORGANIZATION').toUpperCase();
  ctx.fillText(companyText.length > 55 ? companyText.substring(0, 52) + '...' : companyText, 60, 160);

  // 4. Main Job Title (Bold & Prominent)
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';

  const titleWords = options.title.split(' ');
  let line1 = '';
  let line2 = '';

  for (const word of titleWords) {
    if ((line1 + word).length < 32) {
      line1 += (line1 ? ' ' : '') + word;
    } else {
      line2 += (line2 ? ' ' : '') + word;
    }
  }

  ctx.fillText(line1, 60, 230);
  if (line2) {
    ctx.fillText(line2.length > 35 ? line2.substring(0, 32) + '...' : line2, 60, 295);
  }

  // 5. Details Section (Location, Salary, Deadline, Medium)
  const detailY = line2 ? 370 : 310;

  // Location / Country
  const locText = `📍 ${options.location || options.country || 'Sri Lanka'}`;
  ctx.font = '22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#cbd5e1'; // slate-300
  ctx.fillText(locText, 60, detailY);

  // Stated Salary (Highlight Badge if present)
  if (options.salary) {
    ctx.fillStyle = '#059669'; // emerald-600
    ctx.beginPath();
    ctx.roundRect(60, detailY + 25, ctx.measureText(`💰 Salary: ${options.salary}`).width + 30, 44, 8);
    ctx.fill();

    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`💰 Salary: ${options.salary}`, 75, detailY + 54);
  }

  // Medium Badge if present
  if (options.medium) {
    const medX = options.salary ? 100 + ctx.measureText(`💰 Salary: ${options.salary}`).width + 40 : 60;
    const medY = options.salary ? detailY + 25 : detailY + 25;

    ctx.fillStyle = '#4f46e5'; // indigo-600
    ctx.beginPath();
    ctx.roundRect(medX, medY, ctx.measureText(`🗣️ ${options.medium}`).width + 30, 44, 8);
    ctx.fill();

    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`🗣️ ${options.medium}`, medX + 15, medY + 29);
  }

  // 6. Bottom Footer Bar (Closing Date & Apply Call to Action)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 530, 1200, 100);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 530);
  ctx.lineTo(1200, 530);
  ctx.stroke();

  // Closing Date
  if (options.closingDate) {
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.fillText(`⏳ Apply Before: ${options.closingDate}`, 60, 580);
  }

  // Apply Action Callout
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#38bdf8'; // sky-400
  ctx.fillText('🔗 Apply Online & Details: JobNews.lk', 750, 580);

  return canvas.toDataURL('image/png');
}

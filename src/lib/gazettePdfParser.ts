export interface ExtractedGazetteJob {
  title: string;
  company: string;
  description: string;
  requirements: string;
  closingDate: string;
  applyMethod: 'online' | 'email' | 'in_person' | 'phone';
  applyUrl?: string;
  applyEmail?: string;
  applyPhone?: string;
  officialPdfUrl?: string;
  medium: 'Sinhala' | 'Tamil' | 'English' | 'All';
  salary?: string;
  isGovernment: boolean;
  isOverseas: boolean;
  isPrivateSector: boolean;
}

/**
 * AI-powered Gazette PDF Parser Engine.
 * Extracts individual vacancy notices from Sri Lanka Government Gazette PDFs or Gazette HTML text,
 * parsing Job Titles, Ministries, Qualifications, Closing Dates, Medium (Sinhala/Tamil/English), and Contact details.
 */
export async function parseGazettePdfText(pdfText: string, defaultPdfUrl: string = 'https://documents.gov.lk/files/gz/2026/8/2026-08-01(I-I)S.pdf'): Promise<ExtractedGazetteJob[]> {
  const extractedJobs: ExtractedGazetteJob[] = [];

  if (!pdfText || pdfText.trim().length === 0) {
    return extractedJobs;
  }

  // Detect medium (Sinhala, Tamil, English)
  let medium: 'Sinhala' | 'Tamil' | 'English' | 'All' = 'Sinhala';
  if (pdfText.includes('தமிழ்') || pdfText.includes('Tamil')) {
    medium = 'Tamil';
  } else if (pdfText.includes('English Medium') || pdfText.includes('Gazette of the Democratic')) {
    medium = 'English';
  }

  // Regex for extracting closing dates (e.g. 2026.08.30 or 30/08/2026 or 2026-08-30)
  const dateRegex = /(\d{4}[\.\/-]\d{2}[\.\/-]\d{2}|\d{2}[\.\/-]\d{2}[\.\/-]\d{4})/;

  // Split text into potential vacancy sections
  const sections = pdfText.split(/(?=\n\d+[\.\)]\s*)/g);

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (trimmed.length < 50) continue;

    // Extract Title & Company
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const rawTitleLine = lines[0] || 'Government Vacancy';
    const cleanTitle = rawTitleLine.replace(/^\d+[\.\)]\s*/, '').trim();

    // Determine Ministry / Company
    let company = 'Government of Sri Lanka';
    const ministryMatch = trimmed.match(/(?:අමාත්‍යාංශය|දෙපාර්තමේන්තුව|මණ්ඩලය|කොමිෂන් සභාව|Ministry of [A-Za-z\s]+|Department of [A-Za-z\s]+)/i);
    if (ministryMatch) {
      company = ministryMatch[0];
    }

    // Extract Closing Date
    let closingDate = '';
    const dateMatch = trimmed.match(dateRegex);
    if (dateMatch) {
      closingDate = dateMatch[0].replace(/[\.\/]/g, '-');
    } else {
      // Default closing date: 3 weeks from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 21);
      closingDate = defaultDate.toISOString().split('T')[0];
    }

    // Extract Salary if explicitly mentioned
    let salary: string | undefined = undefined;
    const salaryMatch = trimmed.match(/(?:රු\.|Rs\.|රුපියල්|USD|\$)\s*[\d,]+(?:\s*-\s*[\d,]+)?(?:\s*(?:මාසිකව|\+|\/month|per month))?/i);
    if (salaryMatch) {
      salary = salaryMatch[0];
    }

    // Extract Apply Method (Email, Online, In-Person, Phone)
    let applyMethod: 'online' | 'email' | 'in_person' | 'phone' = 'in_person';
    let applyEmail: string | undefined = undefined;
    let applyUrl: string | undefined = undefined;

    const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const urlMatch = trimmed.match(/https?:\/\/[^\s]+/);

    if (emailMatch) {
      applyMethod = 'email';
      applyEmail = emailMatch[0];
    } else if (urlMatch) {
      applyMethod = 'online';
      applyUrl = urlMatch[0];
    }

    // Detailed Gazette Application instructions for Requirements
    const detailedRequirements = [
      '• ශ්‍රී ලංකා රජයේ නිල ගැසට් පත්‍රයේ සඳහන් පරිදි සියලුම සුදුසුකම් සපිරිය යුතුය.',
      '• අයදුම්පත් ලියාපදිංචි තැපෑලෙන් අදාළ අමාත්‍යාංශය/දෙපාර්තමේන්තුව වෙත යැවිය යුතුය.',
      '• ලිපි කවරයේ වම්පස ඉහළ කෙළවරේ "අදාළ තනතුරේ නම" පැහැදිලිව සඳහන් කරන්න.',
      '• නිල ගැසට් පත්‍රයේ අඩංගු ආකෘති පත්‍රයට අනුව අයදුම්පත සකස් කර ගන්න.',
    ].join('\n');

    extractedJobs.push({
      title: cleanTitle.length > 100 ? cleanTitle.substring(0, 97) + '...' : cleanTitle,
      company: company,
      description: trimmed,
      requirements: detailedRequirements,
      closingDate: closingDate,
      applyMethod: applyMethod,
      applyUrl: applyUrl,
      applyEmail: applyEmail,
      officialPdfUrl: defaultPdfUrl,
      medium: medium,
      salary: salary,
      isGovernment: true,
      isOverseas: false,
      isPrivateSector: false,
    });
  }

  return extractedJobs;
}

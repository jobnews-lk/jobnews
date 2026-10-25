export interface StateSector {
  id: string;
  name_si: string;
  name_en: string;
  icon: string;
}

export interface StateInstitution {
  id: string;
  name_si: string;
  name_en: string;
  short_name: string;
  sector: string;
  sector_name: string;
  icon: string;
  website: string;
  keywords: string;
}

export interface CorporateSector {
  id: string;
  name_si: string;
  name_en: string;
  icon: string;
}

export interface CorporateCompany {
  id: string;
  name: string;
  brand: string;
  sector: string;
  sector_label: string;
  icon: string;
  website: string;
  careers_url?: string;
  keywords: string;
}

// 9 State Sectors
export const STATE_SECTORS: StateSector[] = [
  { id: 'all', name_si: 'සියල්ල', name_en: 'All Sectors', icon: '✨' },
  { id: 'banks', name_si: 'රාජ්‍ය බැංකු & මූල්‍ය', name_en: 'State Banks & Finance', icon: '🏦' },
  { id: 'forces', name_si: 'ආරක්ෂක අංශ & පොලීසිය', name_en: 'Tri-Forces & Police', icon: '🛡️' },
  { id: 'departments', name_si: 'දෙපාර්තමේන්තු', name_en: 'Government Departments', icon: '📑' },
  { id: 'corporations', name_si: 'මණ්ඩල & සංස්ථා', name_en: 'Boards & Corporations', icon: '⚡' },
  { id: 'unis', name_si: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන', name_en: 'State Universities', icon: '🎓' },
  { id: 'ministries', name_si: 'අමාත්‍යාංශ', name_en: 'Ministries', icon: '🏛️' },
  { id: 'commissions', name_si: 'කොමිෂන් සභා', name_en: 'Independent Commissions', icon: '⚖️' },
  { id: 'offices', name_si: 'ප්‍රධාන කාර්යාල & අධිකරණ', name_en: 'Key Offices & Judiciary', icon: '🏢' },
];

// 8 Corporate / Private Sectors
export const CORPORATE_SECTORS: CorporateSector[] = [
  { id: 'all', name_si: 'සියල්ල', name_en: 'All Industries', icon: '✨' },
  { id: 'it', name_si: 'IT & Software', name_en: 'IT & Technology', icon: '💻' },
  { id: 'banks', name_si: 'පුද්ගලික බැංකු', name_en: 'Private Banks & Finance', icon: '🏦' },
  { id: 'conglom', name_si: 'Conglomerates', name_en: 'Diversified Conglomerates', icon: '🏢' },
  { id: 'apparel', name_si: 'ඇඟලුම් & නිෂ්පාදන', name_en: 'Apparel & Manufacturing', icon: '🧵' },
  { id: 'telecom', name_si: 'ටෙලිකොම් & මාධ්‍ය', name_en: 'Telecom & Media', icon: '📶' },
  { id: 'hotels', name_si: 'හෝටල් & සංචාරක', name_en: 'Hospitality & Leisure', icon: '🏨' },
  { id: 'hospitals', name_si: 'පුද්ගලික රෝහල්', name_en: 'Private Healthcare', icon: '🏥' },
  { id: 'retail', name_si: 'FMCG & සිල්ලර', name_en: 'Retail & Supermarkets', icon: '🛒' },
];

// 100+ State Institutions Registry
export const STATE_INSTITUTIONS: StateInstitution[] = [
  // State Banks & Finance
  {
    id: 'cbsl',
    name_si: 'ශ්‍රී ලංකා මහ බැංකුව',
    name_en: 'Central Bank of Sri Lanka',
    short_name: 'CBSL',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.cbsl.gov.lk',
    keywords: 'cbsl central bank maha bankuwa මහ බැංකුව'
  },
  {
    id: 'boc',
    name_si: 'ලංකා බැංකුව',
    name_en: 'Bank of Ceylon',
    short_name: 'BOC',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.boc.lk',
    keywords: 'boc bank of ceylon lanka bankuwa ලංකා බැංකුව'
  },
  {
    id: 'peoples-bank',
    name_si: 'මහජන බැංකුව',
    name_en: "People's Bank",
    short_name: "People's Bank",
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.peoplesbank.lk',
    keywords: 'peoples bank mahajana bankuwa මහජන බැංකුව'
  },
  {
    id: 'nsb',
    name_si: 'ජාතික ඉතිරි කිරීමේ බැංකුව',
    name_en: 'National Savings Bank',
    short_name: 'NSB',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.nsb.lk',
    keywords: 'nsb national savings bank ithiri kireeme ජාතික ඉතිරි කිරීමේ'
  },
  {
    id: 'rdb',
    name_si: 'ප්‍රාදේශීය සංවර්ධන බැංකුව',
    name_en: 'Regional Development Bank',
    short_name: 'RDB',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.rdb.lk',
    keywords: 'rdb regional development bank pradeshieya sanwardhana'
  },
  {
    id: 'sfc',
    name_si: 'රාජ්‍ය ενකෙරුම් සහ මූල්‍ය සංස්ථාව',
    name_en: 'State Mortgage & Investment Bank',
    short_name: 'SMIB',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.smib.lk',
    keywords: 'smib state mortgage investment bank'
  },
  {
    id: 'hdfc',
    name_si: 'HDFC බැංකුව',
    name_en: 'HDFC Bank Sri Lanka',
    short_name: 'HDFC',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '🏦',
    website: 'https://www.hdfc.lk',
    keywords: 'hdfc bank housing development finance'
  },
  {
    id: 'epf',
    name_si: 'සේවක අර්ථසාධක අරමුදල',
    name_en: 'Employees Provident Fund',
    short_name: 'EPF',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '💰',
    website: 'https://epf.lk',
    keywords: 'epf employees provident fund arthasadhaka'
  },
  {
    id: 'etf',
    name_si: 'සේවා නියුක්තිකයන්ගේ භාරකාර අරමුදල',
    name_en: 'Employees Trust Fund Board',
    short_name: 'ETF',
    sector: 'banks',
    sector_name: 'රාජ්‍ය බැංකු & මූල්‍ය',
    icon: '💰',
    website: 'https://www.etfb.lk',
    keywords: 'etf etfb employees trust fund bharakara'
  },

  // Tri-Forces & Police
  {
    id: 'army',
    name_si: 'ශ්‍රී ලංකා යුද හමුදාව',
    name_en: 'Sri Lanka Army',
    short_name: 'Army',
    sector: 'forces',
    sector_name: 'ආරක්ෂක අංශ & පොලීසිය',
    icon: '🛡️',
    website: 'https://www.army.lk',
    keywords: 'army sri lanka army yuda hamudawa යුද හමුදාව'
  },
  {
    id: 'navy',
    name_si: 'ශ්‍රී ලංකා නාවික හමුදාව',
    name_en: 'Sri Lanka Navy',
    short_name: 'Navy',
    sector: 'forces',
    sector_name: 'ආරක්ෂක අංශ & පොලීසිය',
    icon: '⚓',
    website: 'https://www.navy.lk',
    keywords: 'navy sri lanka navy nawika hamudawa නාවික හමුදාව'
  },
  {
    id: 'airforce',
    name_si: 'ශ්‍රී ලංකා ගුවන් හමුදාව',
    name_en: 'Sri Lanka Air Force',
    short_name: 'SLAF',
    sector: 'forces',
    sector_name: 'ආරක්ෂක අංශ & පොලීසිය',
    icon: '✈️',
    website: 'https://www.airforce.lk',
    keywords: 'slaf air force guwan hamudawa ගුවන් හමුදාව'
  },
  {
    id: 'police',
    name_si: 'ශ්‍රී ලංකා පොලීසිය',
    name_en: 'Sri Lanka Police',
    short_name: 'Police',
    sector: 'forces',
    sector_name: 'ආරක්ෂක අංශ & පොලීසිය',
    icon: '👮',
    website: 'https://www.police.lk',
    keywords: 'police sri lanka police polisiya පොලීසිය constables si'
  },
  {
    id: 'csd',
    name_si: 'සිවිල් ආරක්ෂක දෙපාර්තමේන්තුව',
    name_en: 'Civil Security Department',
    short_name: 'CSD',
    sector: 'forces',
    sector_name: 'ආරක්ෂක අංශ & පොලීසිය',
    icon: '🛡️',
    website: 'https://www.csd.gov.lk',
    keywords: 'csd civil security siwil arakshaka'
  },

  // Government Departments
  {
    id: 'customs',
    name_si: 'ශ්‍රී ලංකා රේගුව',
    name_en: 'Sri Lanka Customs',
    short_name: 'Customs',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '📑',
    website: 'http://www.customs.gov.lk',
    keywords: 'customs sri lanka customs reguwa රේගුව'
  },
  {
    id: 'ird',
    name_si: 'දේශීය ආදායම් දෙපාර්තමේන්තුව',
    name_en: 'Inland Revenue Department',
    short_name: 'IRD',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '📊',
    website: 'http://www.ird.gov.lk',
    keywords: 'ird inland revenue deshiya aadhayam දේශීය ආදායම්'
  },
  {
    id: 'immigration',
    name_si: 'ආගමන හා විගමන දෙපාර්තමේන්තුව',
    name_en: 'Department of Immigration and Emigration',
    short_name: 'Immigration',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🛂',
    website: 'http://www.immigration.gov.lk',
    keywords: 'immigration passport agamama wigamana ආගමන විගමන'
  },
  {
    id: 'dmt',
    name_si: 'මෝටර් රථ ප්‍රවාහන දෙපාර්තමේන්තුව',
    name_en: 'Department of Motor Traffic',
    short_name: 'DMT (RMV)',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🚗',
    website: 'http://www.motortraffic.gov.lk',
    keywords: 'dmt rmv motor traffic driving license werahara වේරහැර'
  },
  {
    id: 'health-dept',
    name_si: 'සෞඛ්‍ය සේවා දෙපාර්තමේන්තුව',
    name_en: 'Department of Health Services',
    short_name: 'Health Services',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🏥',
    website: 'http://www.health.gov.lk',
    keywords: 'health suwasiripaya doctors nurses සෞඛ්‍ය'
  },
  {
    id: 'labour-dept',
    name_si: 'කම්කරු දෙපාර්තමේන්තුව',
    name_en: 'Department of Labour',
    short_name: 'Labour Dept',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '👷',
    website: 'http://www.labourdept.gov.lk',
    keywords: 'labour department kamkaru කම්කරු'
  },
  {
    id: 'agri-dept',
    name_si: 'කෘෂිකර්ම දෙපාර්තමේන්තුව',
    name_en: 'Department of Agriculture',
    short_name: 'DOA',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🌾',
    website: 'https://doa.gov.lk',
    keywords: 'doa agriculture krushikarma කෘෂිකර්ම'
  },
  {
    id: 'doenets',
    name_si: 'විභාග දෙපාර්තමේන්තුව',
    name_en: 'Department of Examinations',
    short_name: 'DoENets',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '📝',
    website: 'https://www.doenets.lk',
    keywords: 'exams doenets wibhaga විභාග දෙපාර්තමේන්තුව o/l a/l'
  },
  {
    id: 'prisons',
    name_si: 'බන්ධනාගාර දෙපාර්තමේන්තුව',
    name_en: 'Department of Prisons',
    short_name: 'Prisons',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🏢',
    website: 'http://prisons.gov.lk',
    keywords: 'prisons bandhanagara බන්ධනාගාර jailor'
  },
  {
    id: 'archaeology',
    name_si: 'පුරාවිද්‍යා දෙපාර්තමේන්තුව',
    name_en: 'Department of Archaeology',
    short_name: 'Archaeology',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🏛️',
    website: 'http://www.archaeology.gov.lk',
    keywords: 'archaeology purawidya පුරාවිද්‍යා'
  },
  {
    id: 'wildlife',
    name_si: 'වනජීවී සංරක්ෂණ දෙපාර්තමේන්තුව',
    name_en: 'Department of Wildlife Conservation',
    short_name: 'DWC',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🐘',
    website: 'http://www.dwc.gov.lk',
    keywords: 'dwc wildlife wanajiwi වනජීවී ranger'
  },
  {
    id: 'forest',
    name_si: 'වන සංරක්ෂණ දෙපාර්තමේන්තුව',
    name_en: 'Forest Department',
    short_name: 'Forest Dept',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '🌳',
    website: 'http://www.forestdept.gov.lk',
    keywords: 'forest department wana sanrakshana වන සංරක්ෂණ'
  },
  {
    id: 'survey',
    name_si: 'මිනින්දෝරු දෙපාර්තමේන්තුව',
    name_en: 'Survey Department of Sri Lanka',
    short_name: 'Survey Dept',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '📐',
    website: 'http://www.survey.gov.lk',
    keywords: 'survey minindoru මිනින්දෝරු surveyor'
  },
  {
    id: 'pensions',
    name_si: 'විශ්‍රාම වැටුප් දෙපාර්තමේන්තුව',
    name_en: 'Department of Pensions',
    short_name: 'Pensions',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '👴',
    website: 'http://www.pensions.gov.lk',
    keywords: 'pensions wishrama wetup විශ්‍රාම වැටුප්'
  },
  {
    id: 'post',
    name_si: 'තැපැල් දෙපාර්තමේන්තුව',
    name_en: 'Department of Posts (Sri Lanka Post)',
    short_name: 'SL Post',
    sector: 'departments',
    sector_name: 'දෙපාර්තමේන්තු',
    icon: '📮',
    website: 'http://www.slpost.gov.lk',
    keywords: 'post postal thapal තැපැල් postman'
  },

  // Boards & Corporations
  {
    id: 'ceb',
    name_si: 'ලංකා විදුලිබල මණ්ඩලය',
    name_en: 'Ceylon Electricity Board',
    short_name: 'CEB',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '⚡',
    website: 'https://www.ceb.lk',
    keywords: 'ceb ceylon electricity board vidulibala විදුලිබල මණ්ඩලය'
  },
  {
    id: 'cpc',
    name_si: 'ලංකා ඛනිජ තෙල් නීතිගත සංස්ථාව',
    name_en: 'Ceylon Petroleum Corporation',
    short_name: 'CPC (Ceypetco)',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '⛽',
    website: 'https://ceypetco.gov.lk',
    keywords: 'cpc ceypetco khanija thel ඛනිජ තෙල් සංස්ථාව'
  },
  {
    id: 'waterboard',
    name_si: 'ජාතික ජලසම්පාදන හා ජලාපවහන මණ්ඩලය',
    name_en: 'National Water Supply and Drainage Board',
    short_name: 'Water Board (NWSDB)',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '💧',
    website: 'https://www.waterboard.lk',
    keywords: 'nwsdb water board jalasampadana ජල සම්පාදන'
  },
  {
    id: 'sltb',
    name_si: 'ශ්‍රී ලංකා ගමනාගමන මණ්ඩලය',
    name_en: 'Sri Lanka Transport Board',
    short_name: 'SLTB',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🚌',
    website: 'http://sltb.lk',
    keywords: 'sltb transport ctb bus ලංගම ගමනාගමන මණ්ඩලය'
  },
  {
    id: 'slpa',
    name_si: 'ශ්‍රී ලංකා වරාය අධිකාරිය',
    name_en: 'Sri Lanka Ports Authority',
    short_name: 'SLPA',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🚢',
    website: 'https://www.slpa.lk',
    keywords: 'slpa ports authority waraya වරාය අධිකාරිය colombo port'
  },
  {
    id: 'slr',
    name_si: 'ශ්‍රී ලංකා දුම්රිය සේවය',
    name_en: 'Sri Lanka Railways',
    short_name: 'SLR (Railways)',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🚆',
    website: 'http://www.railway.gov.lk',
    keywords: 'slr railway railways dumriya දුම්රිය station master'
  },
  {
    id: 'slt',
    name_si: 'ශ්‍රී ලංකා ටෙලිකොම්',
    name_en: 'Sri Lanka Telecom (SLT-Mobitel)',
    short_name: 'SLT',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '📞',
    website: 'https://www.slt.lk',
    keywords: 'slt telecom mobitel ටෙලිකොම්'
  },
  {
    id: 'rda',
    name_si: 'මාර්ග සංවර්ධන අධිකාරිය',
    name_en: 'Road Development Authority',
    short_name: 'RDA',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🛣️',
    website: 'https://www.rda.gov.lk',
    keywords: 'rda road development marga sanwardhana මාර්ග සංවර්ධන'
  },
  {
    id: 'sltda',
    name_si: 'ශ්‍රී ලංකා සංචාරක සංවර්ධන අධිකාරිය',
    name_en: 'Sri Lanka Tourism Development Authority',
    short_name: 'SLTDA',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🏖️',
    website: 'https://www.sltda.gov.lk',
    keywords: 'sltda tourism sancharaka සංචාරක සංවර්ධන'
  },
  {
    id: 'airport',
    name_si: 'ගුවන්තොටුපළ හා ගුවන් සේවා සමාගම',
    name_en: 'Airport and Aviation Services (Sri Lanka)',
    short_name: 'AASL',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🛫',
    website: 'https://www.airport.lk',
    keywords: 'aasl airport aviation guwan thotupala ගුවන්තොටුපළ katunayake'
  },
  {
    id: 'slbfe',
    name_si: 'ශ්‍රී ලංකා විදේශ සේවා නියුක්ති කාර්යාංශය',
    name_en: 'Sri Lanka Bureau of Foreign Employment',
    short_name: 'SLBFE',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '✈️',
    website: 'https://www.slbfe.lk',
    keywords: 'slbfe foreign employment widesha sewa විදේශ සේවා'
  },
  {
    id: 'naita',
    name_si: 'ජාතික ආධුනිකත්ව සහ කාර්මික පුහුණු කිරීමේ අධිකාරිය',
    name_en: 'National Apprentice and Industrial Training Authority',
    short_name: 'NAITA',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🔧',
    website: 'http://www.naita.gov.lk',
    keywords: 'naita apprentice training adhunika පුහුණු කිරීමේ nvq'
  },
  {
    id: 'vtasl',
    name_si: 'වෘත්තීය පුහුණු අධිකාරිය',
    name_en: 'Vocational Training Authority of Sri Lanka',
    short_name: 'VTA',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '🛠️',
    website: 'http://www.vtasl.gov.lk',
    keywords: 'vta vocational training wruththiya puhunu වෘත්තීය පුහුණු'
  },
  {
    id: 'slbc',
    name_si: 'ශ්‍රී ලංකා ගුවන් විදුලි සංස්ථාව',
    name_en: 'Sri Lanka Broadcasting Corporation',
    short_name: 'SLBC',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '📻',
    website: 'https://www.slbc.lk',
    keywords: 'slbc radio guwan widuli ගුවන් විදුලි සංස්ථාව'
  },
  {
    id: 'rupavahini',
    name_si: 'ශ්‍රී ලංකා රූපවාහිනී සංස්ථාව',
    name_en: 'Sri Lanka Rupavahini Corporation',
    short_name: 'SLRC (Rupavahini)',
    sector: 'corporations',
    sector_name: 'මණ්ඩල & සංස්ථා',
    icon: '📺',
    website: 'http://www.rupavahini.lk',
    keywords: 'slrc rupavahini tv ජාතික රූපවාහිනී'
  },

  // State Universities
  {
    id: 'uoc',
    name_si: 'කොළඹ විශ්වවිද්‍යාලය',
    name_en: 'University of Colombo',
    short_name: 'UOC',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://cmb.ac.lk',
    keywords: 'uoc colombo university kolamba colombo campus කොළඹ'
  },
  {
    id: 'uom',
    name_si: 'මොරටුව විශ්වවිද්‍යාලය',
    name_en: 'University of Moratuwa',
    short_name: 'UOM',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://uom.lk',
    keywords: 'uom moratuwa university engineering architecture මොරටුව'
  },
  {
    id: 'uop',
    name_si: 'පේරාදෙණිය විශ්වවිද්‍යාලය',
    name_en: 'University of Peradeniya',
    short_name: 'UOP',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.pdn.ac.lk',
    keywords: 'uop peradeniya university kandy පේරාදෙණිය'
  },
  {
    id: 'usjp',
    name_si: 'ශ්‍රී ජයවර්ධනපුර විශ්වවිද්‍යාලය',
    name_en: 'University of Sri Jayewardenepura',
    short_name: 'USJP (J’pura)',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.sjp.ac.lk',
    keywords: 'usjp jpura jayawardanapura management ජයවර්ධනපුර'
  },
  {
    id: 'uok',
    name_si: 'කැලණිය විශ්වවිද්‍යාලය',
    name_en: 'University of Kelaniya',
    short_name: 'UOK',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.kln.ac.lk',
    keywords: 'uok kelaniya university කැලණිය'
  },
  {
    id: 'uor',
    name_si: 'රුහුණ විශ්වවිද්‍යාලය',
    name_en: 'University of Ruhuna',
    short_name: 'UOR',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.ruh.ac.lk',
    keywords: 'uor ruhuna university matara රුහුණ'
  },
  {
    id: 'uoj',
    name_si: 'යාපනය විශ්වවිද්‍යාලය',
    name_en: 'University of Jaffna',
    short_name: 'UOJ',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.jfn.ac.lk',
    keywords: 'uoj jaffna university යාපනය'
  },
  {
    id: 'ousl',
    name_si: 'ශ්‍රී ලංකා විවෘත විශ්වවිද්‍යාලය',
    name_en: 'The Open University of Sri Lanka',
    short_name: 'OUSL (Open Uni)',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://ou.ac.lk',
    keywords: 'ousl open university nawala wiwrutha විවෘත'
  },
  {
    id: 'kdu',
    name_si: 'ජනරාල් ශ්‍රීමත් ජෝන් කොතලාවල ආරක්ෂක විශ්වවිද්‍යාලය',
    name_en: 'General Sir John Kotelawala Defence University',
    short_name: 'KDU',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.kdu.ac.lk',
    keywords: 'kdu kotelawala defence university කොතලාවල'
  },
  {
    id: 'sliit',
    name_si: 'ශ්‍රී ලංකා තොරතුරු තාක්ෂණ ආයතනය',
    name_en: 'Sri Lanka Institute of Information Technology',
    short_name: 'SLIIT',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🎓',
    website: 'https://www.sliit.lk',
    keywords: 'sliit it malabe institute information technology'
  },
  {
    id: 'ugc',
    name_si: 'විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව',
    name_en: 'University Grants Commission',
    short_name: 'UGC',
    sector: 'unis',
    sector_name: 'විශ්වවිද්‍යාල & උසස් අධ්‍යාපන',
    icon: '🏛️',
    website: 'https://www.ugc.ac.lk',
    keywords: 'ugc university grants commission prathipadana'
  },

  // Key Ministries
  {
    id: 'mod',
    name_si: 'ආරක්ෂක අමාත්‍යාංශය',
    name_en: 'Ministry of Defence',
    short_name: 'MOD',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'https://www.defence.lk',
    keywords: 'mod ministry defence arakshaka ආරක්ෂක අමාත්‍යාංශය'
  },
  {
    id: 'mof',
    name_si: 'මුදල්, ආර්ථික ස්ථායීකරණ සහ ජාතික ප්‍රතිපත්ති අමාත්‍යාංශය',
    name_en: 'Ministry of Finance',
    short_name: 'Treasury / MOF',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'https://www.treasury.gov.lk',
    keywords: 'mof ministry finance treasury mudhal මුදල් අමාත්‍යාංශය'
  },
  {
    id: 'moe',
    name_si: 'අධ්‍යාපන අමාත්‍යාංශය',
    name_en: 'Ministry of Education',
    short_name: 'MOE (Isurupaya)',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'https://moe.gov.lk',
    keywords: 'moe ministry education isurupaya teachers adhyapana අධ්‍යාපන'
  },
  {
    id: 'moh',
    name_si: 'සෞඛ්‍ය අමාත්‍යාංශය',
    name_en: 'Ministry of Health',
    short_name: 'MOH (Health)',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'http://www.health.gov.lk',
    keywords: 'moh health suwasiripaya saukya සෞඛ්‍ය අමාත්‍යාංශය'
  },
  {
    id: 'pubad',
    name_si: 'රාජ්‍ය පරිපාලන හා ස්වදේශ කටයුතු අමාත්‍යාංශය',
    name_en: 'Ministry of Public Administration',
    short_name: 'PubAd',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'http://www.pubad.gov.lk',
    keywords: 'pubad public administration rajya paripālana රාජ්‍ය පරිපාලන slas'
  },
  {
    id: 'mofa',
    name_si: 'විදේශ කටයුතු අමාත්‍යාංශය',
    name_en: 'Ministry of Foreign Affairs',
    short_name: 'MFA',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'https://mfa.gov.lk',
    keywords: 'mfa foreign affairs videsha katayuthu විදේශ කටයුතු diplomatic'
  },
  {
    id: 'moj',
    name_si: 'අධිකරණ හා ජාතික ඒකාබද්ධතා අමාත්‍යාංශය',
    name_en: 'Ministry of Justice',
    short_name: 'MOJ',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'https://moj.gov.lk',
    keywords: 'moj ministry justice adhikarna අධිකරණ අමාත්‍යාංශය'
  },
  {
    id: 'moa',
    name_si: 'කෘෂිකර්ම හා පශු සම්පත් අමාත්‍යාංශය',
    name_en: 'Ministry of Agriculture',
    short_name: 'Agriculture Min',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'http://www.agrimin.gov.lk',
    keywords: 'ministry agriculture krushikarma කෘෂිකර්ම'
  },
  {
    id: 'mot',
    name_si: 'ප්‍රවාහන හා මහාමාර්ග අමාත්‍යාංශය',
    name_en: 'Ministry of Transport and Highways',
    short_name: 'Transport Min',
    sector: 'ministries',
    sector_name: 'අමාත්‍යාංශ',
    icon: '🏛️',
    website: 'http://www.transport.gov.lk',
    keywords: 'ministry transport highways prawahana ප්‍රවාහන'
  },

  // Commissions & Key Offices
  {
    id: 'psc',
    name_si: 'රාජ්‍ය සේවා කොමිෂන් සභාව',
    name_en: 'Public Service Commission',
    short_name: 'PSC',
    sector: 'commissions',
    sector_name: 'කොමිෂන් සභා',
    icon: '⚖️',
    website: 'http://www.psc.gov.lk',
    keywords: 'psc public service commission rajya sewa රාජ්‍ය සේවා'
  },
  {
    id: 'elections',
    name_si: 'මැතිවරණ කොමිෂන් සභාව',
    name_en: 'Election Commission of Sri Lanka',
    short_name: 'Election Comm',
    sector: 'commissions',
    sector_name: 'කොමිෂන් සභා',
    icon: '🗳️',
    website: 'https://elections.gov.lk',
    keywords: 'elections commission mathiwarana මැතිවරණ'
  },
  {
    id: 'hrcsl',
    name_si: 'ශ්‍රී ලංකා මානව හිමිකම් කොමිෂන් සභාව',
    name_en: 'Human Rights Commission of Sri Lanka',
    short_name: 'HRCSL',
    sector: 'commissions',
    sector_name: 'කොමිෂන් සභා',
    icon: '⚖️',
    website: 'http://www.hrcsl.lk',
    keywords: 'hrcsl human rights manawa himikam මානව හිමිකම්'
  },
  {
    id: 'ciaboc',
    name_si: 'අල්ලස් හෝ දූෂණ චෝදනා විමර්ශන කොමිෂන් සභාව',
    name_en: 'Commission to Investigate Bribery or Corruption',
    short_name: 'Bribery Comm (CIABOC)',
    sector: 'commissions',
    sector_name: 'කොමිෂන් සභා',
    icon: '⚖️',
    website: 'http://www.ciaboc.gov.lk',
    keywords: 'ciaboc bribery corruption allas dushana අල්ලස්'
  },
  {
    id: 'pucsl',
    name_si: 'ශ්‍රී ලංකා මහජන උපයෝගිතා කොමිෂන් සභාව',
    name_en: 'Public Utilities Commission of Sri Lanka',
    short_name: 'PUCSL',
    sector: 'commissions',
    sector_name: 'කොමිෂන් සභා',
    icon: '⚖️',
    website: 'https://www.pucsl.gov.lk',
    keywords: 'pucsl public utilities upayogitha උපයෝගිතා electricity tariff'
  },
  {
    id: 'trcsl',
    name_si: 'ශ්‍රී ලංකා විදුලි සංදේශ නියාමන කොමිෂන් සභාව',
    name_en: 'Telecommunications Regulatory Commission',
    short_name: 'TRCSL',
    sector: 'commissions',
    sector_name: 'කොමිෂන් සභා',
    icon: '📶',
    website: 'http://www.trc.gov.lk',
    keywords: 'trcsl telecom regulatory widuli sandesha විදුලි සංදේශ'
  },
  {
    id: 'president-office',
    name_si: 'ජනාධිපති ලේකම් කාර්යාලය',
    name_en: "President's Secretariat",
    short_name: "President's Office",
    sector: 'offices',
    sector_name: 'ප්‍රධාන කාර්යාල & අධිකරණ',
    icon: '🏛️',
    website: 'https://www.presidentsoffice.gov.lk',
    keywords: 'president secretariat janadhipathi ජනාධිපති ලේකම් කාර්යාලය'
  },
  {
    id: 'parliament',
    name_si: 'ශ්‍රී ලංකා පාර්ලිමේන්තුව',
    name_en: 'Parliament of Sri Lanka',
    short_name: 'Parliament',
    sector: 'offices',
    sector_name: 'ප්‍රධාන කාර්යාල & අධිකරණ',
    icon: '🏛️',
    website: 'https://www.parliament.lk',
    keywords: 'parliament parlimenthuwa පාර්ලිමේන්තුව sri jayawardenepura kotte'
  },
  {
    id: 'supreme-court',
    name_si: 'ශ්‍රී ලංකා ශ්‍රේෂ්ඨාධිකරණය',
    name_en: 'Supreme Court of Sri Lanka',
    short_name: 'Supreme Court',
    sector: 'offices',
    sector_name: 'ප්‍රධාන කාර්යාල & අධිකරණ',
    icon: '⚖️',
    website: 'http://www.supremecourt.lk',
    keywords: 'supreme court shreshtadhikaranaya ශ්‍රේෂ්ඨාධිකරණය hulftsdorp'
  },
  {
    id: 'attorney-general',
    name_si: 'නීතිපති දෙපාර්තමේන්තුව',
    name_en: "Attorney General's Department",
    short_name: 'AG Department',
    sector: 'offices',
    sector_name: 'ප්‍රධාන කාර්යාල & අධිකරණ',
    icon: '⚖️',
    website: 'http://www.attorneygeneral.gov.lk',
    keywords: 'attorney general nithipathi නීතිපති state counsel'
  }
];

// Top Corporate Companies in Sri Lanka
export const CORPORATE_COMPANIES: CorporateCompany[] = [
  // IT & Tech
  {
    id: 'wso2',
    name: 'WSO2 Sri Lanka',
    brand: 'WSO2',
    sector: 'it',
    sector_label: 'IT & Software',
    icon: '💻',
    website: 'https://wso2.com',
    careers_url: 'https://wso2.com/careers',
    keywords: 'wso2 open source integration api software engineer'
  },
  {
    id: 'ifs',
    name: 'IFS Sri Lanka',
    brand: 'IFS',
    sector: 'it',
    sector_label: 'IT & Software',
    icon: '💻',
    website: 'https://www.ifs.com',
    careers_url: 'https://www.ifs.com/about/careers-at-ifs',
    keywords: 'ifs erp enterprise cloud software developer'
  },
  {
    id: 'virtusa',
    name: 'Virtusa Sri Lanka',
    brand: 'Virtusa',
    sector: 'it',
    sector_label: 'IT & Software',
    icon: '💻',
    website: 'https://www.virtusa.com',
    careers_url: 'https://www.virtusa.com/careers',
    keywords: 'virtusa consulting digital engineering tech'
  },
  {
    id: 'lseg',
    name: 'London Stock Exchange Group (LSEG)',
    brand: 'LSEG Technology',
    sector: 'it',
    sector_label: 'IT & Software',
    icon: '💻',
    website: 'https://www.lseg.com',
    careers_url: 'https://www.lseg.com/en/careers',
    keywords: 'lseg london stock exchange fintech trading fintech'
  },
  {
    id: '99x',
    name: '99x Technology',
    brand: '99x',
    sector: 'it',
    sector_label: 'IT & Software',
    icon: '💻',
    website: 'https://99x.io',
    careers_url: 'https://99x.io/careers',
    keywords: '99x product engineering scandinavian agile'
  },
  {
    id: 'sysco-labs',
    name: 'Sysco LABS Sri Lanka',
    brand: 'Sysco LABS',
    sector: 'it',
    sector_label: 'IT & Software',
    icon: '💻',
    website: 'https://syscolabs.lk',
    careers_url: 'https://syscolabs.lk/careers',
    keywords: 'sysco labs foodservice tech cloud architecture'
  },

  // Private Banks
  {
    id: 'combank',
    name: 'Commercial Bank of Ceylon',
    brand: 'COMBANK',
    sector: 'banks',
    sector_label: 'පුද්ගලික බැංකු',
    icon: '🏦',
    website: 'https://www.combank.lk',
    careers_url: 'https://www.combank.lk/careers',
    keywords: 'commercial bank combank private bank banking'
  },
  {
    id: 'sampath',
    name: 'Sampath Bank PLC',
    brand: 'Sampath Bank',
    sector: 'banks',
    sector_label: 'පුද්ගලික බැංකු',
    icon: '🏦',
    website: 'https://www.sampath.lk',
    careers_url: 'https://www.sampath.lk/en/careers',
    keywords: 'sampath bank banking cashier executive trainee'
  },
  {
    id: 'hnb',
    name: 'Hatton National Bank',
    brand: 'HNB',
    sector: 'banks',
    sector_label: 'පුද්ගලික බැංකු',
    icon: '🏦',
    website: 'https://www.hnb.net',
    careers_url: 'https://www.hnb.net/careers',
    keywords: 'hnb hatton national bank banking associate'
  },
  {
    id: 'seylan',
    name: 'Seylan Bank PLC',
    brand: 'Seylan Bank',
    sector: 'banks',
    sector_label: 'පුද්ගලික බැංකු',
    icon: '🏦',
    website: 'https://www.seylan.lk',
    careers_url: 'https://www.seylan.lk/careers',
    keywords: 'seylan bank the bank with a heart banking'
  },
  {
    id: 'dfcc',
    name: 'DFCC Bank PLC',
    brand: 'DFCC Bank',
    sector: 'banks',
    sector_label: 'පුද්ගලික බැංකු',
    icon: '🏦',
    website: 'https://www.dfcc.lk',
    careers_url: 'https://www.dfcc.lk/careers',
    keywords: 'dfcc bank development finance banking'
  },

  // Conglomerates
  {
    id: 'jkh',
    name: 'John Keells Holdings',
    brand: 'JKH',
    sector: 'conglom',
    sector_label: 'Conglomerates',
    icon: '🏢',
    website: 'https://www.keells.com',
    careers_url: 'https://www.keells.com/careers',
    keywords: 'jkh john keells holdings cinnamon keells super tea'
  },
  {
    id: 'hayleys',
    name: 'Hayleys PLC',
    brand: 'Hayleys',
    sector: 'conglom',
    sector_label: 'Conglomerates',
    icon: '🌐',
    website: 'https://www.hayleys.com',
    careers_url: 'https://www.hayleys.com/careers',
    keywords: 'hayleys plantations transportation logistics consumer'
  },
  {
    id: 'hemas',
    name: 'Hemas Holdings PLC',
    brand: 'Hemas',
    sector: 'conglom',
    sector_label: 'Conglomerates',
    icon: '🏢',
    website: 'https://www.hemas.com',
    careers_url: 'https://www.hemas.com/careers',
    keywords: 'hemas healthcare fmcg baby cheramy pharmaceuticals'
  },
  {
    id: 'aitken-spence',
    name: 'Aitken Spence PLC',
    brand: 'Aitken Spence',
    sector: 'conglom',
    sector_label: 'Conglomerates',
    icon: '🏢',
    website: 'https://aitkenspence.com',
    careers_url: 'https://aitkenspence.com/careers',
    keywords: 'aitken spence hotels tourism logistics maritime'
  },
  {
    id: 'softlogic',
    name: 'Softlogic Holdings',
    brand: 'Softlogic',
    sector: 'conglom',
    sector_label: 'Conglomerates',
    icon: '🏢',
    website: 'https://softlogic.lk',
    careers_url: 'https://softlogic.lk/careers',
    keywords: 'softlogic retail electronics asiri hospital glomark'
  },

  // Apparel & Manufacturing
  {
    id: 'mas',
    name: 'MAS Holdings',
    brand: 'MAS',
    sector: 'apparel',
    sector_label: 'ඇඟලුම් & නිෂ්පාදන',
    icon: '🧵',
    website: 'https://www.masholdings.com',
    careers_url: 'https://www.masholdings.com/careers',
    keywords: 'mas holdings apparel activewear garments merchandiser'
  },
  {
    id: 'brandix',
    name: 'Brandix Apparel Limited',
    brand: 'Brandix',
    sector: 'apparel',
    sector_label: 'ඇඟලුම් & නිෂ්පාදන',
    icon: '🧵',
    website: 'https://brandix.com',
    careers_url: 'https://brandix.com/careers',
    keywords: 'brandix apparel garments textile quality production'
  },
  {
    id: 'hirdaramani',
    name: 'Hirdaramani Group',
    brand: 'Hirdaramani',
    sector: 'apparel',
    sector_label: 'ඇඟලුම් & නිෂ්පාදන',
    icon: '🧵',
    website: 'https://www.hirdaramani.com',
    careers_url: 'https://www.hirdaramani.com/careers',
    keywords: 'hirdaramani apparel sustainable garments'
  },
  {
    id: 'maliban',
    name: 'Maliban Biscuit Manufactories',
    brand: 'Maliban',
    sector: 'apparel',
    sector_label: 'ඇඟලුම් & නිෂ්පාදන',
    icon: '🍪',
    website: 'https://malibanbiscuit.com',
    careers_url: 'https://malibanbiscuit.com/careers',
    keywords: 'maliban biscuit food manufacturing confectionery'
  },

  // Telecom & Media
  {
    id: 'dialog',
    name: 'Dialog Axiata PLC',
    brand: 'Dialog',
    sector: 'telecom',
    sector_label: 'ටෙලිකොම් & මාධ්‍ය',
    icon: '📶',
    website: 'https://www.dialog.lk',
    careers_url: 'https://www.dialog.lk/careers',
    keywords: 'dialog axiata telecom mobile 5g broadband engineer'
  },
  {
    id: 'mobitel',
    name: 'SLT-Mobitel',
    brand: 'Mobitel',
    sector: 'telecom',
    sector_label: 'ටෙලිකොම් & මාධ්‍ය',
    icon: '📶',
    website: 'https://www.mobitel.lk',
    careers_url: 'https://www.mobitel.lk/careers',
    keywords: 'mobitel national mobile network telecommunications'
  },
  {
    id: 'maharaja',
    name: 'The Capital Maharaja Group (TCMG)',
    brand: 'Maharaja (Sirasa)',
    sector: 'telecom',
    sector_label: 'ටෙලිකොම් & මාධ්‍ය',
    icon: '📺',
    website: 'https://www.capitalmaharaja.com',
    careers_url: 'https://www.capitalmaharaja.com/careers',
    keywords: 'maharaja sirasa tv shakthi newsfirst media broadcast'
  },
  {
    id: 'derana',
    name: 'Derana Macro Entertainment (TV Derana)',
    brand: 'Derana',
    sector: 'telecom',
    sector_label: 'ටෙලිකොම් & මාධ්‍ය',
    icon: '📺',
    website: 'https://www.derana.lk',
    careers_url: 'https://www.derana.lk/careers',
    keywords: 'derana tv derana adaderana news broadcast media'
  },

  // Hospitality & Leisure
  {
    id: 'cinnamon',
    name: 'Cinnamon Hotels & Resorts',
    brand: 'Cinnamon',
    sector: 'hotels',
    sector_label: 'හෝටල් & සංචාරක',
    icon: '🏨',
    website: 'https://www.cinnamonhotels.com',
    careers_url: 'https://www.cinnamonhotels.com/careers',
    keywords: 'cinnamon grand lakeside red rove hospitality tourism chef'
  },
  {
    id: 'jetwing',
    name: 'Jetwing Hotels',
    brand: 'Jetwing',
    sector: 'hotels',
    sector_label: 'හෝටල් & සංචාරක',
    icon: '🏨',
    website: 'https://www.jetwinghotels.com',
    careers_url: 'https://www.jetwinghotels.com/careers',
    keywords: 'jetwing blue lagoon lighthouse hospitality hotel jobs'
  },
  {
    id: 'heritance',
    name: 'Heritance Hotels & Resorts',
    brand: 'Heritance',
    sector: 'hotels',
    sector_label: 'හෝටල් & සංචාරක',
    icon: '🏨',
    website: 'https://www.heritancehotels.com',
    careers_url: 'https://www.heritancehotels.com/careers',
    keywords: 'heritance kandMessage kandalama negombo resort'
  },
  {
    id: 'anantara-sl',
    name: 'Anantara Peace Haven Tangalle / Kalutara',
    brand: 'Anantara SL',
    sector: 'hotels',
    sector_label: 'හෝටල් & සංචාරක',
    icon: '🏨',
    website: 'https://www.anantara.com',
    careers_url: 'https://minor.wd102.myworkdayjobs.com/en-US/Careers',
    keywords: 'anantara minor luxury resort hospitality front office'
  },

  // Private Hospitals & Healthcare
  {
    id: 'asiri',
    name: 'Asiri Health (Asiri Hospitals)',
    brand: 'Asiri Health',
    sector: 'hospitals',
    sector_label: 'පුද්ගලික රෝහල්',
    icon: '🏥',
    website: 'https://www.asirihealth.com',
    careers_url: 'https://www.asirihealth.com/careers',
    keywords: 'asiri surgical central hospital nurse pharmacist healthcare'
  },
  {
    id: 'nawaloka',
    name: 'Nawaloka Hospitals PLC',
    brand: 'Nawaloka',
    sector: 'hospitals',
    sector_label: 'පුද්ගලික රෝහල්',
    icon: '🏥',
    website: 'https://www.nawaloka.com',
    careers_url: 'https://www.nawaloka.com/careers',
    keywords: 'nawaloka hospital private medical nursing healthcare'
  },
  {
    id: 'lanka-hospitals',
    name: 'The Lanka Hospitals Corporation',
    brand: 'Lanka Hospitals',
    sector: 'hospitals',
    sector_label: 'පුද්ගලික රෝහල්',
    icon: '🏥',
    website: 'https://www.lankahospitals.com',
    careers_url: 'https://www.lankahospitals.com/careers',
    keywords: 'lanka hospitals apollo colombo healthcare laboratory'
  },
  {
    id: 'durdans',
    name: 'Durdans Hospital',
    brand: 'Durdans',
    sector: 'hospitals',
    sector_label: 'පුද්ගලික රෝහල්',
    icon: '🏥',
    website: 'https://www.durdans.com',
    careers_url: 'https://www.durdans.com/careers',
    keywords: 'durdans heart centre healthcare nursing laboratory'
  },

  // FMCG & Retail Supermarkets
  {
    id: 'keells-super',
    name: 'JayKay Marketing Services (Keells Super)',
    brand: 'Keells Super',
    sector: 'retail',
    sector_label: 'FMCG & සිල්ලර',
    icon: '🛒',
    website: 'https://www.keellssuper.com',
    careers_url: 'https://www.keellssuper.com/careers',
    keywords: 'keells supermarket retail cashier inventory store manager'
  },
  {
    id: 'cargills',
    name: 'Cargills (Ceylon) PLC',
    brand: 'Cargills Food City',
    sector: 'retail',
    sector_label: 'FMCG & සිල්ලර',
    icon: '🛒',
    website: 'https://www.cargillsceylon.com',
    careers_url: 'https://www.cargillsceylon.com/careers',
    keywords: 'cargills food city kfc magic ice cream retail supermarket'
  },
  {
    id: 'unilever',
    name: 'Unilever Sri Lanka',
    brand: 'Unilever',
    sector: 'retail',
    sector_label: 'FMCG & සිල්ලර',
    icon: '🧴',
    website: 'https://www.unilever.com.lk',
    careers_url: 'https://careers.unilever.com',
    keywords: 'unilever fmcg sunlight signal knorr brand manager sales'
  },
  {
    id: 'nestle',
    name: 'Nestlé Lanka PLC',
    brand: 'Nestlé Lanka',
    sector: 'retail',
    sector_label: 'FMCG & සිල්ලර',
    icon: '☕',
    website: 'https://www.nestle.lk',
    careers_url: 'https://www.nestle.lk/jobs',
    keywords: 'nestle milo maggi nescafe nutrition production'
  }
];

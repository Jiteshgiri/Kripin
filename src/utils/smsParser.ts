import { SmsAlert } from '../types';

const CREDIT_KEYWORDS = ['credited', 'received', 'deposit', 'added', 'refund', 'salary', 'allowance', 'stipend'];
const DEBIT_KEYWORDS = ['spent', 'debited', 'paid', 'sent', 'transferred', 'withdrawn', 'purchase', 'charged'];

export function parseSmsText(messageText: string): SmsAlert | null {
  if (!messageText || messageText.trim().length < 10) return null;

  const lowerText = messageText.toLowerCase();

  // Check transaction validity
  const isTransaction =
    CREDIT_KEYWORDS.some((kw) => lowerText.includes(kw)) ||
    DEBIT_KEYWORDS.some((kw) => lowerText.includes(kw));

  if (!isTransaction) return null;

  // Extract amount using regex
  const amountRegex = /(?:RS|RS\.|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
  const match = messageText.match(amountRegex);

  if (!match || !match[1]) return null;

  const cleanAmountStr = match[1].replace(/,/g, '');
  const amount = parseFloat(cleanAmountStr);

  if (isNaN(amount) || amount <= 0) return null;

  // Determine income vs expense
  const isIncome =
    CREDIT_KEYWORDS.some((kw) => lowerText.includes(kw)) &&
    !lowerText.includes('debited') &&
    !lowerText.includes('spent');

  const merchant = extractMerchant(messageText);
  const category = autoCategorize(merchant, lowerText);

  return {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    rawText: messageText,
    amount,
    merchant,
    isIncome,
    category,
    timestamp: Date.now(),
  };
}

function extractMerchant(text: string): string {
  const lower = text.toLowerCase();

  // Common app matches
  if (lower.includes('swiggy')) return 'Swiggy';
  if (lower.includes('zomato')) return 'Zomato';
  if (lower.includes('uber')) return 'Uber';
  if (lower.includes('ola')) return 'Ola Rides';
  if (lower.includes('rapido')) return 'Rapido';
  if (lower.includes('amazon')) return 'Amazon';
  if (lower.includes('flipkart')) return 'Flipkart';
  if (lower.includes('myntra')) return 'Myntra';
  if (lower.includes('phonepe')) return 'PhonePe Transfer';
  if (lower.includes('gpay') || lower.includes('google pay')) return 'Google Pay';
  if (lower.includes('paytm')) return 'Paytm Wallet';
  if (lower.includes('starbucks')) return 'Starbucks';
  if (lower.includes('airtel')) return 'Airtel Recharge';
  if (lower.includes('jio')) return 'Jio Recharge';
  if (lower.includes('netflix')) return 'Netflix Subscription';
  if (lower.includes('spotify')) return 'Spotify';
  if (lower.includes('bookmyshow')) return 'BookMyShow';

  // Pattern matching: at [Merchant] or to [Merchant] or towards [Merchant]
  const pattern = /(?:at|to|on|towards|for|vpa)\s+([A-Za-z0-9\s\.&'-]{2,20})/i;
  const match = text.match(pattern);

  if (match && match[1]) {
    let candidate = match[1].trim();
    const stopWords = ['using', 'via', 'ref', 'avbl', 'bal', 'bank', 'card', 'account', 'a/c', 'upi', 'val', 'dt', 'on'];
    for (const word of stopWords) {
      const idx = candidate.toLowerCase().indexOf(` ${word}`);
      if (idx !== -1) {
        candidate = candidate.substring(0, idx).trim();
      }
    }
    if (candidate.length >= 2) return capitalizeWords(candidate);
  }

  return isIncomeKeyword(lower) ? 'Salary / Allowance' : 'Bank Transaction';
}

function isIncomeKeyword(lowerText: string): boolean {
  return lowerText.includes('salary') || lowerText.includes('stipend') || lowerText.includes('allowance');
}

function autoCategorize(merchant: string, fullTextLower: string): string {
  const combined = `${merchant.toLowerCase()} ${fullTextLower}`;

  if (
    combined.includes('swiggy') ||
    combined.includes('zomato') ||
    combined.includes('starbucks') ||
    combined.includes('mcdonald') ||
    combined.includes('kfc') ||
    combined.includes('restaurant') ||
    combined.includes('food') ||
    combined.includes('cafe') ||
    combined.includes('dining') ||
    combined.includes('chai')
  ) {
    return 'Food & Dining';
  }

  if (
    combined.includes('uber') ||
    combined.includes('ola') ||
    combined.includes('rapido') ||
    combined.includes('metro') ||
    combined.includes('irctc') ||
    combined.includes('fuel') ||
    combined.includes('petrol') ||
    combined.includes('cab') ||
    combined.includes('travel')
  ) {
    return 'Travel & Commute';
  }

  if (
    combined.includes('amazon') ||
    combined.includes('flipkart') ||
    combined.includes('myntra') ||
    combined.includes('zara') ||
    combined.includes('mall') ||
    combined.includes('shopping')
  ) {
    return 'Shopping';
  }

  if (
    combined.includes('rent') ||
    combined.includes('broker') ||
    combined.includes('pg') ||
    combined.includes('hostel') ||
    combined.includes('stay')
  ) {
    return 'Rent & Stay';
  }

  if (
    combined.includes('airtel') ||
    combined.includes('jio') ||
    combined.includes('bill') ||
    combined.includes('electricity') ||
    combined.includes('wifi') ||
    combined.includes('water') ||
    combined.includes('gas') ||
    combined.includes('recharge')
  ) {
    return 'Bills & Utilities';
  }

  if (
    combined.includes('salary') ||
    combined.includes('pocket money') ||
    combined.includes('allowance') ||
    combined.includes('stipend') ||
    combined.includes('freelance')
  ) {
    return 'Salary / Allowance';
  }

  if (
    combined.includes('movie') ||
    combined.includes('netflix') ||
    combined.includes('spotify') ||
    combined.includes('bookmyshow') ||
    combined.includes('gaming')
  ) {
    return 'Entertainment';
  }

  return 'Other';
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

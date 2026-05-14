export const cityMapping: Record<string, string> = {
  '212': 'New York, NY', '310': 'Los Angeles, CA', '312': 'Chicago, IL',
  '713': 'Houston, TX', '215': 'Philadelphia, PA', '602': 'Phoenix, AZ',
  '210': 'San Antonio, TX', '619': 'San Diego, CA', '214': 'Dallas, TX',
  '408': 'San Jose, CA', '415': 'San Francisco, CA', '206': 'Seattle, WA',
  '305': 'Miami, FL', '404': 'Atlanta, GA', '617': 'Boston, MA'
};

export function extractAreaCode(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const num = phone.replace(/\D/g, '');
  if (num.length === 10 || num.length === 11) {
    return num.length === 11 ? num.slice(1, 4) : num.slice(0, 3);
  }
  return null;
}

export function parseClaimNumber(claimNumber) {
  if (!claimNumber) return { year: null, sequence: null };
  const match = claimNumber.match(/^CLM-(\d{4})-(\d{3,})$/);
  if (!match) return { year: null, sequence: null };
  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10),
  };
}

export function formatClaimNumberDisplay(claimNumber) {
  if (!claimNumber) return '-';
  return claimNumber;
}

export function generateClaimNumber(year, sequence) {
  return `CLM-${year}-${String(sequence).padStart(3, '0')}`;
}

export function getClaimNumberParts(claimNumber) {
  const parsed = parseClaimNumber(claimNumber);
  if (!parsed.year) return { prefix: 'CLM', year: '', sequence: '' };
  return {
    prefix: 'CLM',
    year: String(parsed.year),
    sequence: String(parsed.sequence).padStart(3, '0'),
  };
}
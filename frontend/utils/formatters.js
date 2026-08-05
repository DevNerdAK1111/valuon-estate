export const formatEuro = (val) => 
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

export const formatEuroInt = (val) => 
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(val || 0));

export const formatPct = (val) => 
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

/**
 * Format amount as Indian Rupees
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₹0';
  }
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  } catch (error) {
    return `₹${Math.round(numAmount)}`;
  }
};

/**
 * Simple price formatting
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'Free';
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice) || numPrice === 0) {
    return 'Free';
  }
  
  return `₹${numPrice}`;
};

/**
 * Format price with rupee symbol
 */
export const formatPriceWithSymbol = (price) => {
  if (price === null || price === undefined || price === '') {
    return '₹0';
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '₹0';
  }
  
  return `₹${numPrice}`;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = () => {
  return '₹';
};

/**
 * Display amount with formatting
 */
export const displayAmount = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) {
    return showSymbol ? '₹0' : '0';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? '₹0' : '0';
  }
  
  const formatted = new Intl.NumberFormat('en-IN').format(numAmount);
  return showSymbol ? `₹${formatted}` : formatted;
};
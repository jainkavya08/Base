export const formatCurrency = (amount: number, hideDecimals = true): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: hideDecimals ? 0 : 2,
    minimumFractionDigits: hideDecimals ? 0 : 2,
  }).format(amount);
};

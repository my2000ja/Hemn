export const USD_TO_IQD_RATE = 1500;

export const usdToIqd = (usdAmount: number): number => {
  return Math.round((usdAmount || 0) * USD_TO_IQD_RATE);
};

export const iqdToUsd = (iqdAmount: number): number => {
  return Number(((iqdAmount || 0) / USD_TO_IQD_RATE).toFixed(2));
};

export const formatIQD = (usdAmount: number): string => {
  const iqd = Math.round((usdAmount || 0) * USD_TO_IQD_RATE);
  return `${iqd.toLocaleString()} د.ع`;
};

export const formatDualCurrency = (usdAmount: number): string => {
  const iqd = Math.round((usdAmount || 0) * USD_TO_IQD_RATE).toLocaleString();
  return `${iqd} د.ع ($${(usdAmount || 0).toLocaleString()})`;
};

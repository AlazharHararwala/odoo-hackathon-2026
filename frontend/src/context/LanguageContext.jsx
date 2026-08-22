import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const currencyRates = {
  'USD ($)': { symbol: '$', rate: 0.012 },
  'INR (₹)': { symbol: '₹', rate: 1.0 },
  'EUR (€)': { symbol: '€', rate: 0.011 },
  'GBP (£)': { symbol: '£', rate: 0.0095 },
  'JPY (¥)': { symbol: '¥', rate: 1.85 },
  'CAD ($)': { symbol: 'CA$', rate: 0.016 },
  'AUD ($)': { symbol: 'A$', rate: 0.018 },
  'AED (د.إ)': { symbol: 'AED ', rate: 0.044 },
};

export const LanguageProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('globetrotter_preferences') || '{}');
      return stored.currency || 'USD ($)';
    } catch {
      return 'USD ($)';
    }
  });

  const setCurrency = (newCurr) => {
    setCurrencyState(newCurr);
    try {
      const stored = JSON.parse(localStorage.getItem('globetrotter_preferences') || '{}');
      stored.currency = newCurr;
      localStorage.setItem('globetrotter_preferences', JSON.stringify(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const updatePreferences = ({ currency: newCurr }) => {
    if (newCurr) setCurrency(newCurr);
  };

  // Direct text passthrough without language translation
  const t = (key, fallback = '') => fallback || key;

  // Currency Formatter
  const formatPrice = (amountInINR = 0, allowFree = false) => {
    if (amountInINR === 0 && allowFree) return 'Free';
    const currConfig = currencyRates[currency] || currencyRates['USD ($)'];
    const converted = Math.round((Number(amountInINR) || 0) * currConfig.rate);
    return `${currConfig.symbol}${converted.toLocaleString()}`;
  };

  const getCurrencySymbol = () => {
    const currConfig = currencyRates[currency] || currencyRates['USD ($)'];
    return currConfig.symbol;
  };

  return (
    <LanguageContext.Provider
      value={{
        currency,
        setCurrency,
        updatePreferences,
        t,
        formatPrice,
        getCurrencySymbol,
        currencySymbol: getCurrencySymbol(),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

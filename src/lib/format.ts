import { SITE } from '../config/constants';

export const formatPrice = (amount: number, currency = SITE.currency) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);

export const PERIOD_OPTIONS = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mês' },
];

const DAYS_BY_PERIOD = { day: 1, week: 7, month: 30 };

export function periodToDays(period) {
  return DAYS_BY_PERIOD[period] || DAYS_BY_PERIOD.month;
}

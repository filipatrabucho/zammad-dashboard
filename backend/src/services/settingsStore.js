const fs = require('fs');
const path = require('path');

// Persistência simples em ficheiro — suficiente para uma instância única
// deste dashboard. Guardado fora do código (backend/data/, no .gitignore),
// para as alterações feitas no Backoffice sobreviverem a deploys/restarts.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'wallboard-settings.json');

const VALID_PERIODS = ['day', 'week', 'month'];
const VALID_THEMES = ['dark', 'light'];
const MIN_COFFEE_DURATION_S = 5;
const MAX_COFFEE_DURATION_S = 600;

const DEFAULT_SETTINGS = {
  period: 'month',
  theme: 'dark',
  widgets: {
    kpiOpen: true,
    kpiCreatedToday: true,
    kpiClosedToday: true,
    kpiSlaAtRisk: true,
    chartTimeseries: true,
    chartByState: true,
    chartByGroup: true,
    chartByAssignee: true,
    chartStaleTickets: true,
    chartUnassignedQueue: true,
  },
  coffeeBreak: {
    enabled: true,
    hours: [10, 16],
    durationSeconds: 60,
  },
  newTicketSound: true,
};

const WIDGET_KEYS = Object.keys(DEFAULT_SETTINGS.widgets);

function readSettings() {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return sanitize(parsed);
  } catch (err) {
    return sanitize({});
  }
}

function sanitizeHours(input) {
  if (!Array.isArray(input)) return [...DEFAULT_SETTINGS.coffeeBreak.hours];
  const hours = input
    .map((h) => parseInt(h, 10))
    .filter((h) => Number.isInteger(h) && h >= 0 && h <= 23);
  return Array.from(new Set(hours)).sort((a, b) => a - b);
}

function sanitizeDuration(input) {
  const n = parseInt(input, 10);
  if (!Number.isInteger(n) || n < MIN_COFFEE_DURATION_S || n > MAX_COFFEE_DURATION_S) {
    return DEFAULT_SETTINGS.coffeeBreak.durationSeconds;
  }
  return n;
}

function sanitize(input) {
  const source = input && typeof input === 'object' ? input : {};
  const period = VALID_PERIODS.includes(source.period) ? source.period : DEFAULT_SETTINGS.period;
  const theme = VALID_THEMES.includes(source.theme) ? source.theme : DEFAULT_SETTINGS.theme;

  const widgets = { ...DEFAULT_SETTINGS.widgets };
  if (source.widgets && typeof source.widgets === 'object') {
    WIDGET_KEYS.forEach((key) => {
      if (typeof source.widgets[key] === 'boolean') {
        widgets[key] = source.widgets[key];
      }
    });
  }

  const coffeeSource = source.coffeeBreak && typeof source.coffeeBreak === 'object' ? source.coffeeBreak : {};
  const coffeeBreak = {
    enabled: typeof coffeeSource.enabled === 'boolean' ? coffeeSource.enabled : DEFAULT_SETTINGS.coffeeBreak.enabled,
    hours: sanitizeHours(coffeeSource.hours),
    durationSeconds: sanitizeDuration(coffeeSource.durationSeconds),
  };

  const newTicketSound =
    typeof source.newTicketSound === 'boolean' ? source.newTicketSound : DEFAULT_SETTINGS.newTicketSound;

  return { period, theme, widgets, coffeeBreak, newTicketSound };
}

function writeSettings(input) {
  const clean = sanitize(input);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(clean, null, 2));
  return clean;
}

module.exports = {
  readSettings,
  writeSettings,
  DEFAULT_SETTINGS,
  VALID_PERIODS,
  VALID_THEMES,
  WIDGET_KEYS,
};

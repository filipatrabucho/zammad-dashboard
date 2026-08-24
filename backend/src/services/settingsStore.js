const fs = require('fs');
const path = require('path');

// Persistência simples em ficheiro — suficiente para uma instância única
// deste dashboard. Guardado fora do código (backend/data/, no .gitignore),
// para as alterações feitas no Backoffice sobreviverem a deploys/restarts.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'wallboard-settings.json');

const VALID_PERIODS = ['day', 'week', 'month'];

const DEFAULT_SETTINGS = {
  period: 'month',
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
};

const WIDGET_KEYS = Object.keys(DEFAULT_SETTINGS.widgets);

function readSettings() {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return sanitize(parsed);
  } catch (err) {
    return { ...DEFAULT_SETTINGS, widgets: { ...DEFAULT_SETTINGS.widgets } };
  }
}

function sanitize(input) {
  const source = input && typeof input === 'object' ? input : {};
  const period = VALID_PERIODS.includes(source.period) ? source.period : DEFAULT_SETTINGS.period;

  const widgets = { ...DEFAULT_SETTINGS.widgets };
  if (source.widgets && typeof source.widgets === 'object') {
    WIDGET_KEYS.forEach((key) => {
      if (typeof source.widgets[key] === 'boolean') {
        widgets[key] = source.widgets[key];
      }
    });
  }

  return { period, widgets };
}

function writeSettings(input) {
  const clean = sanitize(input);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(clean, null, 2));
  return clean;
}

module.exports = { readSettings, writeSettings, DEFAULT_SETTINGS, VALID_PERIODS, WIDGET_KEYS };

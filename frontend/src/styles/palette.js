// Paleta de dados (ver skill "dataviz") — cores categóricas em ordem fixa,
// nunca cicladas. Modo escuro é o próprio conjunto de passos validado para
// a superfície escura, não um "inverter" automático do modo claro.
const light = {
  categorical: [
    '#2a78d6', // 1 blue
    '#eb6834', // 2 orange
    '#1baf7a', // 3 aqua
    '#eda100', // 4 yellow
    '#e87ba4', // 5 magenta
    '#008300', // 6 green
    '#4a3aa7', // 7 violet
    '#e34948', // 8 red
  ],
  ink: {
    primary: '#0b0b0b',
    secondary: '#52514e',
    muted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
    surface: '#fcfcfb',
  },
  sequentialBlue: '#2a78d6',
};

const dark = {
  categorical: [
    '#3987e5', // 1 blue
    '#d95926', // 2 orange
    '#199e70', // 3 aqua
    '#c98500', // 4 yellow
    '#d55181', // 5 magenta
    '#008300', // 6 green
    '#9085e9', // 7 violet
    '#e66767', // 8 red
  ],
  ink: {
    primary: '#ffffff',
    secondary: '#c3c2b7',
    muted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
    surface: '#1a1a19',
  },
  sequentialBlue: '#3987e5',
};

// Status (bom/aviso/sério/crítico) é fixo — nunca temado, igual em
// ambos os modos.
export const status = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export function getPalette(dark_ = false) {
  return dark_ ? dark : light;
}

// Compatibilidade com o modo claro (uso direto, sem passar `dark`).
export const { categorical, ink, sequentialBlue } = light;

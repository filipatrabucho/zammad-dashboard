import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseOutlined,
  BgColorsOutlined,
  CalendarOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SyncOutlined,
  CoffeeOutlined,
  BellOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { getWallboardSettings, updateWallboardSettings } from '../api/endpoints';
import { PERIOD_OPTIONS } from '../utils/period';
import BrandMark from '../components/Common/BrandMark';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';
import ServersManager from '../components/Backoffice/ServersManager';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
];

const WIDGET_GROUPS = {
  indicators: [
    { key: 'kpiOpen', label: 'Tickets abertos' },
    { key: 'kpiCreatedToday', label: 'Criados hoje' },
    { key: 'kpiClosedToday', label: 'Fechados hoje' },
    { key: 'kpiSlaAtRisk', label: 'SLA em risco' },
  ],
  charts: [
    { key: 'chartTimeseries', label: 'Criados vs fechados' },
    { key: 'chartByState', label: 'Distribuição por estado' },
    { key: 'chartByGroup', label: 'Tickets por grupo' },
    { key: 'chartByAssignee', label: 'Tickets por assignee' },
    { key: 'chartUnassignedQueue', label: 'Fila sem atribuição' },
    { key: 'chartStaleTickets', label: 'Sem resposta há mais tempo' },
    { key: 'chartByOrganization', label: 'Tickets por cliente' },
    { key: 'chartTopCreators', label: 'Principais criadores de tickets' },
    { key: 'chartByCategory', label: 'Tickets por categoria' },
  ],
};

const SECTIONS = [
  { key: 'appearance', label: 'Aparência', icon: BgColorsOutlined },
  { key: 'period', label: 'Período', icon: CalendarOutlined },
  { key: 'indicators', label: 'Indicadores', icon: DashboardOutlined },
  { key: 'charts', label: 'Gráficos', icon: BarChartOutlined },
  { key: 'carousel', label: 'Carrossel', icon: SyncOutlined },
  { key: 'coffee', label: 'Pausa para café', icon: CoffeeOutlined },
  { key: 'notifications', label: 'Notificações', icon: BellOutlined },
  { key: 'servers', label: 'Servidores', icon: CloudServerOutlined },
];

export default function Backoffice() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [newHour, setNewHour] = useState(10);
  const [activeSection, setActiveSection] = useState('appearance');

  useEffect(() => {
    getWallboardSettings()
      .then(setSettings)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  const setPeriod = (value) => {
    setSettings((s) => ({ ...s, period: value }));
    setSaved(false);
  };

  const setTheme = (value) => {
    setSettings((s) => ({ ...s, theme: value }));
    setSaved(false);
  };

  const toggleNewTicketSound = () => {
    setSettings((s) => ({ ...s, newTicketSound: !s.newTicketSound }));
    setSaved(false);
  };

  const setCoffeeDuration = (value) => {
    const seconds = Math.min(600, Math.max(5, Number(value) || 60));
    setSettings((s) => ({ ...s, coffeeBreak: { ...s.coffeeBreak, durationSeconds: seconds } }));
    setSaved(false);
  };

  const setCarouselInterval = (value) => {
    const seconds = Math.min(120, Math.max(5, Number(value) || 20));
    setSettings((s) => ({ ...s, carouselIntervalSeconds: seconds }));
    setSaved(false);
  };

  const toggleWidget = (key) => {
    setSettings((s) => ({ ...s, widgets: { ...s.widgets, [key]: !s.widgets[key] } }));
    setSaved(false);
  };

  const toggleCoffeeEnabled = () => {
    setSettings((s) => ({ ...s, coffeeBreak: { ...s.coffeeBreak, enabled: !s.coffeeBreak.enabled } }));
    setSaved(false);
  };

  const addCoffeeHour = () => {
    setSettings((s) => {
      const hours = Array.from(new Set([...s.coffeeBreak.hours, Number(newHour)])).sort((a, b) => a - b);
      return { ...s, coffeeBreak: { ...s.coffeeBreak, hours } };
    });
    setSaved(false);
  };

  const removeCoffeeHour = (hour) => {
    setSettings((s) => ({
      ...s,
      coffeeBreak: { ...s.coffeeBreak, hours: s.coffeeBreak.hours.filter((h) => h !== hour) },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateWallboardSettings(settings);
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeLabel = SECTIONS.find((s) => s.key === activeSection)?.label;
  const showGlobalSave = activeSection !== 'servers';

  return (
    <div className="backoffice-page dark-theme">
      <aside className="backoffice-sidebar">
        <div className="backoffice-sidebar-brand">
          <BrandMark size={26} />
          <span>Backoffice</span>
        </div>

        <nav className="backoffice-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={activeSection === s.key ? 'active' : ''}
              onClick={() => setActiveSection(s.key)}
            >
              <s.icon /> {s.label}
            </button>
          ))}
        </nav>

        <Link to="/" className="btn-secondary backoffice-sidebar-back">
          <ArrowLeftOutlined /> Voltar ao wallboard
        </Link>
      </aside>

      <div className="backoffice-main">
        <header className="backoffice-topbar">
          <h1>{activeLabel}</h1>
          {showGlobalSave && (
            <div className="backoffice-actions">
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving || loading}>
                {saving ? 'A guardar…' : 'Guardar alterações'}
              </button>
              {saved && (
                <span className="backoffice-saved">
                  <CheckCircleFilled /> Guardado — o wallboard atualiza-se sozinho em instantes.
                </span>
              )}
            </div>
          )}
        </header>

        <div className="backoffice-content">
          {error && <ErrorBanner message={error} />}

          {loading ? (
            <LoadingSpinner label="A carregar definições…" />
          ) : (
            settings && (
              <>
                {activeSection === 'appearance' && (
                  <section className="backoffice-section">
                    <div className="backoffice-section-heading">
                      <p className="backoffice-hint">Tema visual do ecrã da Sala IT.</p>
                    </div>
                    <div className="segmented">
                      {THEME_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={settings.theme === opt.value ? 'active' : ''}
                          onClick={() => setTheme(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {activeSection === 'period' && (
                  <section className="backoffice-section">
                    <div className="backoffice-section-heading">
                      <p className="backoffice-hint">Aplica-se a todos os gráficos e indicadores.</p>
                    </div>
                    <div className="segmented">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={settings.period === opt.value ? 'active' : ''}
                          onClick={() => setPeriod(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {activeSection === 'indicators' && (
                  <section className="backoffice-section">
                    <div className="backoffice-toggle-grid">
                      {WIDGET_GROUPS.indicators.map((item) => (
                        <label key={item.key} className="backoffice-toggle">
                          <input
                            type="checkbox"
                            checked={settings.widgets[item.key]}
                            onChange={() => toggleWidget(item.key)}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {activeSection === 'charts' && (
                  <section className="backoffice-section">
                    <div className="backoffice-section-heading">
                      <p className="backoffice-hint">
                        "Fila sem atribuição", "Sem resposta há mais tempo", "Tickets por grupo" e "Tickets por
                        assignee" alternam em carrossel com "Tickets por cliente", "Principais criadores" e "Tickets
                        por categoria" — configura o intervalo em Carrossel.
                      </p>
                    </div>
                    <div className="backoffice-toggle-grid">
                      {WIDGET_GROUPS.charts.map((item) => (
                        <label key={item.key} className="backoffice-toggle">
                          <input
                            type="checkbox"
                            checked={settings.widgets[item.key]}
                            onChange={() => toggleWidget(item.key)}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {activeSection === 'carousel' && (
                  <section className="backoffice-section">
                    <div className="backoffice-section-heading">
                      <p className="backoffice-hint">
                        De quanto em quanto tempo o wallboard troca automaticamente entre os dois grupos de gráficos.
                        As setas/pontos no ecrã também permitem trocar manualmente.
                      </p>
                    </div>
                    <label className="backoffice-duration">
                      <span>Intervalo do carrossel</span>
                      <div className="backoffice-duration-input">
                        <input
                          type="number"
                          min={5}
                          max={120}
                          step={5}
                          value={settings.carouselIntervalSeconds}
                          onChange={(e) => setCarouselInterval(e.target.value)}
                        />
                        <span className="backoffice-duration-unit">segundos</span>
                      </div>
                      <span className="backoffice-hint">Entre 5s e 2min.</span>
                    </label>
                  </section>
                )}

                {activeSection === 'coffee' && (
                  <section className="backoffice-section">
                    <div className="backoffice-section-heading">
                      <p className="backoffice-hint">
                        A que horas o wallboard toca um aviso e mostra o ecrã de pausa. Usa o botão ▶ no wallboard
                        (só visível a admins) para testar sem esperar pela hora.
                      </p>
                    </div>

                    <label className="backoffice-toggle">
                      <input type="checkbox" checked={settings.coffeeBreak.enabled} onChange={toggleCoffeeEnabled} />
                      <span>Ativar pausas para café</span>
                    </label>

                    <div className="coffee-hours-list">
                      {settings.coffeeBreak.hours.length === 0 && (
                        <span className="backoffice-hint">Nenhuma hora definida.</span>
                      )}
                      {settings.coffeeBreak.hours.map((h) => (
                        <span key={h} className="coffee-hour-chip">
                          {String(h).padStart(2, '0')}:00
                          <button type="button" onClick={() => removeCoffeeHour(h)} aria-label={`Remover ${h}:00`}>
                            <CloseOutlined />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="coffee-hour-add">
                      <select value={newHour} onChange={(e) => setNewHour(e.target.value)}>
                        {Array.from({ length: 24 }, (_, h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn-secondary" onClick={addCoffeeHour}>
                        Adicionar hora
                      </button>
                    </div>

                    <label className="backoffice-duration">
                      <span>Duração do ecrã de pausa</span>
                      <div className="backoffice-duration-input">
                        <input
                          type="number"
                          min={5}
                          max={600}
                          step={5}
                          value={settings.coffeeBreak.durationSeconds}
                          onChange={(e) => setCoffeeDuration(e.target.value)}
                        />
                        <span className="backoffice-duration-unit">segundos</span>
                      </div>
                      <span className="backoffice-hint">
                        ≈ {Math.round((settings.coffeeBreak.durationSeconds / 60) * 10) / 10} min. Entre 5s e 10min.
                      </span>
                    </label>
                  </section>
                )}

                {activeSection === 'notifications' && (
                  <section className="backoffice-section">
                    <label className="backoffice-toggle">
                      <input type="checkbox" checked={settings.newTicketSound} onChange={toggleNewTicketSound} />
                      <span>Tocar som quando entra um ticket novo</span>
                    </label>
                  </section>
                )}

                {activeSection === 'servers' && <ServersManager />}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

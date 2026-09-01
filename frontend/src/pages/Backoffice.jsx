import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, CheckCircleFilled, CloseOutlined } from '@ant-design/icons';
import { getWallboardSettings, updateWallboardSettings } from '../api/endpoints';
import { PERIOD_OPTIONS } from '../utils/period';
import BrandMark from '../components/Common/BrandMark';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
];

const WIDGET_GROUPS = [
  {
    title: 'Indicadores',
    items: [
      { key: 'kpiOpen', label: 'Tickets abertos' },
      { key: 'kpiCreatedToday', label: 'Criados hoje' },
      { key: 'kpiClosedToday', label: 'Fechados hoje' },
      { key: 'kpiSlaAtRisk', label: 'SLA em risco' },
    ],
  },
  {
    title: 'Gráficos',
    items: [
      { key: 'chartTimeseries', label: 'Criados vs fechados' },
      { key: 'chartByState', label: 'Distribuição por estado' },
      { key: 'chartByGroup', label: 'Tickets por grupo' },
      { key: 'chartByAssignee', label: 'Tickets por assignee' },
      { key: 'chartUnassignedQueue', label: 'Fila sem atribuição' },
      { key: 'chartStaleTickets', label: 'Sem resposta há mais tempo' },
    ],
  },
];

export default function Backoffice() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [newHour, setNewHour] = useState(10);

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

  return (
    <div className="backoffice-page dark-theme">
      <header className="backoffice-header">
        <div className="backoffice-brand">
          <BrandMark size={28} />
          <div>
            <h1>Backoffice</h1>
            <span className="backoffice-header-subtitle">Configuração do wallboard — Sala IT</span>
          </div>
        </div>
        <Link to="/" className="btn-secondary">
          <ArrowLeftOutlined /> Voltar ao wallboard
        </Link>
      </header>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner label="A carregar definições…" />
      ) : (
        settings && (
          <div className="backoffice-body">
            <section className="backoffice-section">
              <div className="backoffice-section-heading">
                <h2>Aparência</h2>
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

            <section className="backoffice-section">
              <div className="backoffice-section-heading">
                <h2>Período</h2>
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

            {WIDGET_GROUPS.map((group) => (
              <section key={group.title} className="backoffice-section">
                <div className="backoffice-section-heading">
                  <h2>{group.title}</h2>
                </div>
                <div className="backoffice-toggle-grid">
                  {group.items.map((item) => (
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
            ))}

            <section className="backoffice-section">
              <div className="backoffice-section-heading">
                <h2>Pausa para café</h2>
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

            <section className="backoffice-section">
              <div className="backoffice-section-heading">
                <h2>Notificações</h2>
              </div>
              <label className="backoffice-toggle">
                <input type="checkbox" checked={settings.newTicketSound} onChange={toggleNewTicketSound} />
                <span>Tocar som quando entra um ticket novo</span>
              </label>
            </section>

            <div className="backoffice-actions">
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'A guardar…' : 'Guardar alterações'}
              </button>
              {saved && (
                <span className="backoffice-saved">
                  <CheckCircleFilled /> Guardado — o wallboard atualiza-se sozinho em instantes.
                </span>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

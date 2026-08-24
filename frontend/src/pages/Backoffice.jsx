import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons';
import { getWallboardSettings, updateWallboardSettings } from '../api/endpoints';
import { PERIOD_OPTIONS } from '../utils/period';
import BrandMark from '../components/Common/BrandMark';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';

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

  const toggleWidget = (key) => {
    setSettings((s) => ({ ...s, widgets: { ...s.widgets, [key]: !s.widgets[key] } }));
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

import { useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { getServers, createServer, updateServer, deleteServer } from '../../api/endpoints';
import ErrorBanner from '../Common/ErrorBanner';

const EMPTY_FORM = { name: '', endpoint: '', bearerToken: '', insecureTLS: false };

export default function ServersManager() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getServers()
      .then(setServers)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (server) => {
    setEditingId(server.id);
    setForm({ name: server.name, endpoint: server.endpoint, bearerToken: '', insecureTLS: server.insecureTLS });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateServer(editingId, form);
      } else {
        await createServer(form);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (server) => {
    if (!window.confirm(`Remover "${server.name}"?`)) return;
    setError(null);
    try {
      await deleteServer(server.id);
      if (editingId === server.id) cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <section className="backoffice-section">
      <div className="backoffice-section-heading">
        <p className="backoffice-hint">
          Endpoints externos (com bearer token opcional) a monitorizar no wallboard, no painel "Outros servidores".
          O pedido de estado é sempre feito pelo backend — o token nunca chega ao browser.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <p className="backoffice-hint">A carregar…</p>
      ) : (
        <div className="servers-list">
          {servers.length === 0 && <p className="backoffice-hint">Nenhum servidor configurado ainda.</p>}
          {servers.map((s) => (
            <div key={s.id} className="servers-row">
              <div className="servers-row-info">
                <span className="servers-row-name">
                  {s.name}
                  {s.insecureTLS && (
                    <span className="servers-row-badge" title="Verificação de certificado TLS desligada para este servidor">
                      TLS inseguro
                    </span>
                  )}
                </span>
                <span className="servers-row-endpoint">{s.endpoint}</span>
              </div>
              <span className="servers-row-token">{s.hasToken ? `Token ${s.tokenPreview}` : 'Sem token'}</span>
              <div className="servers-row-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => startEdit(s)}
                  aria-label={`Editar ${s.name}`}
                >
                  <EditOutlined />
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => handleDelete(s)}
                  aria-label={`Remover ${s.name}`}
                >
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="servers-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="ex: VPN"
            required
          />
        </label>
        <label>
          Endpoint
          <input
            type="url"
            value={form.endpoint}
            onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
            placeholder="https://exemplo.com/health"
            required
          />
        </label>
        <label>
          Bearer token {editingId && '(opcional — deixa em branco para manter o atual)'}
          <input
            type="password"
            value={form.bearerToken}
            onChange={(e) => setForm((f) => ({ ...f, bearerToken: e.target.value }))}
            placeholder={editingId ? '••••••••' : 'opcional'}
            autoComplete="new-password"
          />
        </label>
        <label className="servers-form-checkbox">
          <input
            type="checkbox"
            checked={form.insecureTLS}
            onChange={(e) => setForm((f) => ({ ...f, insecureTLS: e.target.checked }))}
          />
          <span>
            Ignorar erros de certificado TLS
            <small>Só para desenvolvimento (certificado autoassinado) — nunca uses isto num endpoint público.</small>
          </span>
        </label>
        <div className="servers-form-actions">
          {editingId && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              <CloseOutlined /> Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            <PlusOutlined /> {editingId ? (saving ? 'A guardar…' : 'Guardar') : saving ? 'A adicionar…' : 'Adicionar'}
          </button>
        </div>
      </form>
    </section>
  );
}

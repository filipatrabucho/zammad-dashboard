export default function TicketsFilters({ filters, onChange, states, groups, onClear }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value, page: 1 });

  return (
    <div className="filters-bar">
      <input
        type="search"
        placeholder="Pesquisar por texto…"
        value={filters.query}
        onChange={update('query')}
        className="filter-input filter-search"
      />
      <select value={filters.state} onChange={update('state')} className="filter-input">
        <option value="">Todos os estados</option>
        {states.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      <select value={filters.group} onChange={update('group')} className="filter-input">
        <option value="">Todos os grupos</option>
        {groups.map((g) => (
          <option key={g.id} value={g.name}>
            {g.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Email do assignee…"
        value={filters.assignee}
        onChange={update('assignee')}
        className="filter-input"
      />
      <button type="button" className="btn-secondary" onClick={onClear}>
        Limpar
      </button>
    </div>
  );
}

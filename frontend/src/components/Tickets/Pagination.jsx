export default function Pagination({ page, hasMore, onPageChange }) {
  return (
    <div className="pagination">
      <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Anterior
      </button>
      <span className="pagination-label">Página {page}</span>
      <button type="button" className="btn-secondary" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
        Seguinte →
      </button>
    </div>
  );
}

function RowSelector({ rows, currentRow, onSelect }) {
    if (!rows.length) return null;
    return (
      <div className="row-selector">
        {rows.map(r => (
          <button
            key={r}
            onClick={() => onSelect(r)}
            className={r === currentRow ? 'active' : ''}
          >
            Rząd {r}
          </button>
        ))}
      </div>
    );
  }
  export default RowSelector;
function GridView({ items, backendUrl }) {
    if (!items.length) return <div className="hint">Brak rzeczy w tym rzędzie</div>;
  
    // group by column & height
    const grid = {};
    items.forEach(it => {
      const col = it.column;
      const h = it.height;
      if (!grid[col]) grid[col] = {};
      if (!grid[col][h]) grid[col][h] = [];
      grid[col][h].push(it);
    });
  
    const cols = Object.keys(grid).sort((a, b) => a - b);
    const maxH = Math.max(...items.map(i => i.height));
    const heightsDesc = [...Array(maxH + 1).keys()].reverse(); // highest first, 0 last
  
    return (
      <table className="grid">
        <thead>
          <tr>
            <th></th>
            {cols.map(c => <th key={c}>Kol {c}</th>)}
          </tr>
        </thead>
        <tbody>
          {heightsDesc.map(h => (
            <tr key={h}>
              <td className="y">H {h}</td>
              {cols.map(c => (
                <td key={c} className="cell">
                  {(grid[c][h] || []).map(it => (
                    <div key={it.id} className="cell-item">
                      {it.name_pl || it.name} ({it.amount})
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  export default GridView;
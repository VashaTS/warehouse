function SearchBar({ query, setQuery, fetchAll }) {
  return (
    <div className="toolbar">
      <input
        type="text"
        placeholder="szukaj..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search"
      />
      <button onClick={fetchAll}>Pokaż wszystko</button>
    </div>
  );
}
export default SearchBar;
  
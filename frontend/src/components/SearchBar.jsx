function SearchBar({ query, setQuery }) {
    return (
      <input
        type="text"
        placeholder="szukaj..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          marginBottom: '1rem',
          boxSizing: 'border-box'
        }}
      />
    );
  }
  export default SearchBar;
  
function ItemForm({ newItem, setNewItem, file, setFile, handleSubmit, editId, setEditId }) {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewItem(prev => ({ ...prev, [name]: value }));
    };
  
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    return (
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '0.8rem' }}>
        {[['name', 'Nazwa po angielsku'], ['name_pl', 'Nazwa po polsku'], ['category', 'Kategoria'],
          ['room', 'Pokój'], ['row', 'Rząd'], ['column', 'Kolumna'], ['height', 'Wysokość'],
          ['depth', 'Głębokość'], ['amount', 'Ilość'], ['expiry_date', 'Data ważności'],
          ['keywords', 'Keywords'], ['notes', 'Uwagi'], ['image_url', 'URL Obrazu']].map(([field, label]) => (
          <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={field}>{label}</label>
            <input
              id={field}
              name={field}
              type={field === 'expiry_date' ? 'date' : ['row', 'column', 'height', 'depth', 'amount'].includes(field) ? 'number' : 'text'}
              value={newItem[field]}
              onChange={handleInputChange}
              style={{ padding: '0.4rem' }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="file">Wgraj zdjęcie</label>
          <input id="file" type="file" accept="image/*" onChange={handleFileChange} /><br />
        </div>
        <button type="submit">{editId ? 'Zapisz zmiany' : 'Dodaj to'}</button>
        {editId && (
          <button type="button" onClick={() => setEditId(null)}>Anuluj edycje</button>
        )}
      </form>
    );
  }
  export default ItemForm;
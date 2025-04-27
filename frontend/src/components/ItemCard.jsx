function ItemCard({ item, setEditId, setShowForm, setNewItem, setModalImage, backendUrl }) {
    return (
      <li
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
          padding: '0.5rem',
          border: '1px solid #666',
          borderRadius: '8px',
          gap: '1rem'
        }}
      >
        <div style={{ flex: 1 }}>
          <strong>{item.name_pl || item.name}</strong><br />
          Ilość: {item.amount}<br />
          {item.expiry_date && <span>Data ważności: {item.expiry_date}<br /></span>}
          <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
            📦 {item.room}, rząd {item.row}, kolumna {item.column}, wysokość {item.height}, głębokość {item.depth}
          </div>
          <button onClick={() => {
            setShowForm(true);
            setNewItem({ ...item, expiry_date: item.expiry_date || '' });
            setEditId(item.id);
          }}>
            Edycja
          </button>
        </div>
        {item.image_url && (
          <div style={{ cursor: 'pointer' }} onClick={() => setModalImage(`${backendUrl}/uploads/${item.image_url.split("/").pop()}`)}>
            <img
              src={`${backendUrl}/uploads/thumb_${item.image_url.split("/").pop()}`}
              alt="thumb"
              style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '4px' }}
            />
          </div>
        )}
      </li>
    );
  }
  export default ItemCard;
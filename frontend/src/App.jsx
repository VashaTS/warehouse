import { useState, useEffect } from 'react';

function App() {
  const backendHost = window.location.hostname;
  const backendPort = 8000;
  const backendUrl = `http://${backendHost}:${backendPort}`;

  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    name_pl: '',
    category: '',
    room: 'main',
    row: 0,
    column: 0,
    height: 0,
    depth: 0,
    amount: 1,
    expiry_date: '',
    keywords: '',
    notes: '',
    image_url: ''
  });

  // live search
  useEffect(() => {
    if (query.length === 0) {
      setItems([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetch(`${backendUrl}/items/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => setItems(data))
        .catch(err => console.error(err));
    }, 300); // debounce typing by 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const dataToSend = { ...newItem };

    ['row', 'column', 'height', 'depth', 'amount'].forEach((key) => {
    dataToSend[key] = parseInt(dataToSend[key], 10);
    if (isNaN(dataToSend[key])) dataToSend[key] = 0;
    });

    // remove fields that are empty strings, null, or undefined
    Object.keys(dataToSend).forEach((key) => {
      if (
    dataToSend[key] === '' ||
    dataToSend[key] === null ||
    dataToSend[key] === undefined
  ) {
    delete dataToSend[key];
  }
});
    const url = editId
      ? `${backendUrl}/items/${editId}`
      : `${backendUrl}/items`;
  
    const method = editId ? 'PUT' : 'POST';
  
    // console.log("Sending:", dataToSend); // optional debug
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
    
      const uploadResponse = await fetch(`${backendUrl}/upload/`, {
        method: 'POST',
        body: formData,
      });
    
      const uploadData = await uploadResponse.json();
      dataToSend.image_url = `/uploads/${uploadData.filename}`;  // link to image
    }
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
  
    if (response.ok) {
      setNewItem({
        name: '',
        name_pl: '',
        category: '',
        room: '',
        row: 0,
        column: 0,
        height: 0,
        depth: 0,
        amount: 1,
        expiry_date: '',
        keywords: '',
        notes: '',
        image_url: ''
      });
      setEditId(null);
      setShowForm(false);  // 👈 hide the form
      setQuery('');        // optionally refresh search
    } else {
      console.error("Error status", response.status);
      console.error(await response.text());
      alert('Coś poszło nie tak :(');
    }
  };
  
  

  return (
    <div style={{ maxWidth: '1000px', padding: '0 1rem', boxSizing: 'border-box', margin: '2rem auto', fontFamily: 'sans-serif', color: 'white', width: '100%' }}>
      <h1>Szukaj w magazynie</h1>
      {modalImage && (
  <div
    onClick={() => setModalImage(null)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      cursor: 'zoom-out'
    }}
  >
    <img
      src={modalImage}
      alt="Full"
      style={{ maxHeight: '90%', maxWidth: '90%', borderRadius: '8px' }}
    />
  </div>
)}

      <input
        type="text"
        placeholder="szukaj..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}
      />

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '1rem' }}>
        {showForm ? (editId ? 'Ukryj edycję' : 'Ukryj dodawanie') : 'Dodaj nową rzecz'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '0.8rem' }}>
        {[
          ['name', 'Nazwa po angielsku'],
          ['name_pl', 'Nazwa po polsku'],
          ['category', 'Kategoria'],
          ['room', 'Pokój'],
          ['row', 'Rząd'],
          ['column', 'Kolumna'],
          ['height', 'Wysokość'],
          ['depth', 'Głębokość'],
          ['amount', 'Ilość'],
          ['expiry_date', 'Data ważności'],
          ['keywords', 'Keywords'],
          ['notes', 'Uwagi'],
          ['image_url', 'URL Obrazu']
        ].map(([field, label]) => (
          <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={field}>{label}</label>
            <input
              id={field}
              name={field}
              type={
                field === 'expiry_date' ? 'date'
                : ['row', 'column', 'height', 'depth', 'amount'].includes(field) ? 'number'
                : 'text'
              }
              value={newItem[field]}
              onChange={handleInputChange}
              style={{ padding: '0.4rem' }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
  <label htmlFor="file">Wgraj zdjęcie</label>
  <input
    id="file"
    type="file"
    accept="image/*"
    onChange={handleFileChange}
  /><br />
        <button type="submit">{editId ? 'Zapisz zmiany' : 'Dodaj to'}</button>

        {editId && (
  <button type="button" onClick={() => {
    setEditId(null);
    setNewItem({
      name: '',
      name_pl: '',
      category: '',
      room: '',
      row: 0,
      column: 0,
      height: 0,
      depth: 0,
      amount: 1,
      expiry_date: '',
      keywords: '',
      notes: '',
      image_url: ''
    });
  }}>
    Anuluj edycje
  </button>
)}

</div>
      </form>
      
      )}

<ul style={{ listStyle: 'none', padding: 0 }}>
  {items.map(item => (
    <li
      key={item.id}
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
      {/* text on the left */}
      <div style={{ flex: 1 }}>
        <strong>{item.name_pl || item.name}</strong><br />
        Ilość: {item.amount}<br />
        {item.expiry_date && (
          <span>Data ważności: {item.expiry_date}<br /></span>
        )}
        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
          📦 {item.room}, rząd {item.row}, kolumna {item.column}, wysokość {item.height}, głębokość {item.depth}
        </div>
        <button onClick={() => {
          setShowForm(true);
          setNewItem({
            ...item,
            expiry_date: item.expiry_date || '',
          });
          setEditId(item.id);
        }}>
          Edycja
        </button>
      </div>

      {/* image on the right */}
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
  ))}
</ul>
    </div>
  );
}

export default App;

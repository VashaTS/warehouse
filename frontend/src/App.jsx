// src/App.jsx
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import ImageModal from './components/ImageModal';

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
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = { ...newItem };

    ['row', 'column', 'height', 'depth', 'amount'].forEach((key) => {
      dataToSend[key] = parseInt(dataToSend[key], 10);
      if (isNaN(dataToSend[key])) dataToSend[key] = 0;
    });

    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
        delete dataToSend[key];
      }
    });

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch(`${backendUrl}/upload/`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      dataToSend.image_url = `/uploads/${uploadData.filename}`;
    }

    const url = editId ? `${backendUrl}/items/${editId}` : `${backendUrl}/items`;
    const method = editId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    if (response.ok) {
      setNewItem({
        name: '', name_pl: '', category: '', room: '', row: 0, column: 0,
        height: 0, depth: 0, amount: 1, expiry_date: '', keywords: '', notes: '', image_url: ''
      });
      setEditId(null);
      setShowForm(false);
      setQuery('');
    } else {
      console.error("Error status", response.status);
      console.error(await response.text());
      alert('Coś poszło nie tak :(');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', padding: '0 1rem', boxSizing: 'border-box', margin: '2rem auto', fontFamily: 'sans-serif', color: 'white', width: '100%' }}>
      <h1>Szukaj w magazynie</h1>
      {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}

      <SearchBar query={query} setQuery={setQuery} />

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '1rem' }}>
        {showForm ? (editId ? 'Ukryj edycję' : 'Ukryj dodawanie') : 'Dodaj nową rzecz'}
      </button>

      {showForm && (
        <ItemForm
          newItem={newItem}
          setNewItem={setNewItem}
          file={file}
          setFile={setFile}
          handleSubmit={handleSubmit}
          editId={editId}
          setEditId={setEditId}
        />
      )}

      <ItemList items={items} setEditId={setEditId} setShowForm={setShowForm} setNewItem={setNewItem} setModalImage={setModalImage} backendUrl={backendUrl} />
    </div>
  );
}

export default App;

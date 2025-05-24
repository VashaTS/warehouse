import { useState, useEffect } from 'react';
import { thumbSrc, fullSrc } from '../utils/img';

function ItemForm({ newItem, setNewItem, file, setFile, handleSubmit, editId, setEditId, backendUrl,EMPTY_ITEM }) {
    // Set image preview when editing or adding a new item
    useEffect(() => {
        setFile(null);
        if (!editId) {
            // When adding a new item, reset the image and file
            
            setNewItem(EMPTY_ITEM);
        } else {
            // When editing an existing item, preserve the image URL from the database
            // The existing image_url from newItem should already be set as part of the data
        }
    }, [editId]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile); // Set the new file

        // Update image_url in newItem for the new image
        setNewItem(prev => ({
            ...prev,
            image_url: selectedFile ? URL.createObjectURL(selectedFile) : prev.image_url
        }));
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setFile(null); // Clear file
        setNewItem(EMPTY_ITEM);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '0.8rem' }}>
            {[['name', 'Nazwa po angielsku'], ['name_pl', 'Nazwa po polsku'], ['category', 'Kategoria'],
              ['room', 'Pokój'], ['row', 'Rząd'], ['column', 'Kolumna'], ['height', 'Wysokość'],
              ['depth', 'Głębokość'], ['amount', 'Ilość'], ['expiry_date', 'Data ważności'],
              ['keywords', 'Keywords'], ['notes', 'Uwagi']].map(([field, label]) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor={field}>{label}</label>
                    <input
  id={field}
  name={field}
  type={
    field === 'expiry_date'
      ? 'date'
      : ['row','column','height','depth','amount'].includes(field)
        ? 'number'
        : 'text'
  }
  value={
    ['row','column','height','depth','amount'].includes(field)
      ? (newItem[field] ?? '')        // number inputs
      : (newItem[field] ?? '')        // text / date inputs
  }
  onChange={e =>
    setNewItem(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  style={{ padding:'0.4rem' }}
/>

                </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="file">Wgraj zdjęcie</label>
                <input id="file" type="file" accept="image/*" onChange={handleFileChange} /><br />
                
                {/* If there is an existing image URL, show the existing image as thumbnail */}
                {newItem.image_url && !file && (
                    <img src={thumbSrc(backendUrl,newItem.image_url)} alt="Current Item" style={{ maxWidth: '200px', marginTop: '10px' }} />
                )}
                
                {/* If a new file is selected, show the new thumbnail */}
                {file && (
                    <img src={URL.createObjectURL(file)} alt="New Item" style={{ maxWidth: '200px', marginTop: '10px' }} />
                )}
            </div>
            <button type="submit">{editId ? 'Zapisz zmiany' : 'Dodaj to'}</button>
            {editId && (
                <button type="button" onClick={handleCancelEdit}>Anuluj edycje</button>
            )}
        </form>
    );
}

export default ItemForm;

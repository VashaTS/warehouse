import ItemCard from './ItemCard';

function ItemList({ items, setEditId, setShowForm, setNewItem, setModalImage, backendUrl }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          setEditId={setEditId}
          setShowForm={setShowForm}
          setNewItem={setNewItem}
          setModalImage={setModalImage}
          backendUrl={backendUrl}
        />
      ))}
    </ul>
  );
}
export default ItemList;
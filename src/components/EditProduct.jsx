import { useState } from 'react';

export default function EditProduct({ token, product, onUpdate, onCancel }) {
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price || '');
  const [category, setCategory] = useState(product.category || 'Seeds');
  const [prebookingEnabled, setPrebookingEnabled] = useState(product.prebookingEnabled !== false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`http://localhost:3001/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, price: Number(price), category, prebookingEnabled }),
      });
      
      const data = await res.json();
      if (res.ok) {
        onUpdate && onUpdate(data);
      } else {
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setError('Failed to update product');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="edit-product-form">
      <h3>Edit Product</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Product Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="Seeds">Seeds</option>
          <option value="Herbicides">Herbicides</option>
          <option value="Insecticides">Insecticides</option>
          <option value="Fertilizers">Fertilizers</option>
        </select>
        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={prebookingEnabled}
              onChange={e => setPrebookingEnabled(e.target.checked)}
            />
            Enable Prebooking for this product
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-update"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

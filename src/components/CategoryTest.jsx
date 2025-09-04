import { useState, useEffect } from 'react';

export default function CategoryTest() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setMessage('Failed to load categories');
      }
    } catch (error) {
      setMessage('Error loading categories: ' + error.message);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      setMessage('Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        setNewCategory('');
        loadCategories(); // Reload categories
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to add category');
      }
    } catch (error) {
      setMessage('Error adding category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '800px', 
      margin: '0 auto',
      background: '#f1f3f6',
      minHeight: '100vh',
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        border: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '24px', 
          fontWeight: '500', 
          color: '#212121' 
        }}>
          Category Management Test
        </h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#424242' 
            }}>
              New Category Name
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              style={{ 
                width: '100%',
                padding: '12px 16px', 
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#212121',
                background: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2874f0'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <button 
            onClick={addCategory} 
            disabled={loading}
            style={{ 
              padding: '12px 20px',
              background: loading ? '#bdbdbd' : '#2874f0',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#1565c0';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#2874f0';
            }}
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>

        {message && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: message.includes('Error') || message.includes('Failed') ? '#ffebee' : '#e8f5e8',
            color: message.includes('Error') || message.includes('Failed') ? '#c62828' : '#2e7d32',
            marginBottom: '20px',
            borderRadius: '6px',
            fontSize: '14px',
            border: `1px solid ${message.includes('Error') || message.includes('Failed') ? '#ffcdd2' : '#c8e6c9'}`
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '18px', 
          fontWeight: '500', 
          color: '#212121',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '8px'
        }}>
          Existing Categories
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {categories.length > 0 ? (
            categories.map((category) => (
              <div 
                key={category._id} 
                style={{ 
                  padding: '16px', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '6px',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = '#bdbdbd';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fafafa';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <strong style={{ fontSize: '16px', color: '#212121' }}>{category.name}</strong>
                {category.description && (
                  <p style={{ margin: '6px 0 0 0', color: '#757575', fontSize: '14px' }}>
                    {category.description}
                  </p>
                )}
                <small style={{ color: '#9e9e9e', fontSize: '12px' }}>
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            <p style={{ color: '#757575', textAlign: 'center', padding: '24px', fontSize: '14px' }}>
              No categories found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

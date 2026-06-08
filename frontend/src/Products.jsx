import { useState, useEffect } from 'react';
import api from './api';

function Products() {
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock_quantity: ''
  });

  // NEW: State to track if we are currently editing a product
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // UPDATED: Handle both Create and Update logic
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity)
      };

      if (editingId) {
        // We are in Edit Mode -> Send a PUT request
        await api.put(`/products/${editingId}`, payload);
        setEditingId(null); // Exit edit mode
      } else {
        // We are in Add Mode -> Send a POST request
        await api.post('/products', payload);
      }
      
      // Clear form and refresh table
      setFormData({ name: '', sku: '', price: '', stock_quantity: '' });
      fetchProducts();
    } catch (error) {
      alert(`Error ${editingId ? 'updating' : 'adding'} product: ` + (error.response?.data?.detail || "Something went wrong"));
    }
  };

  // NEW: Populate the form when "Edit" is clicked
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock_quantity: product.stock_quantity
    });
    setEditingId(product.id);
    // Smoothly scroll back to the top so the user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NEW: Cancel an active edit
  const handleCancelEdit = () => {
    setFormData({ name: '', sku: '', price: '', stock_quantity: '' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts(); 
      } catch (error) {
        alert("Error deleting product: " + (error.response?.data?.detail || "Make sure this product isn't tied to an order."));
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Products Management</h2>

      {/* DYNAMIC FORM (Handles both Add and Edit) */}
      <div style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '15px', color: editingId ? '#3498db' : '#2c3e50' }}>
          {editingId ? `Edit Product (ID: ${editingId})` : 'Add New Product'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="text" name="name" placeholder="Product Name" required
            value={formData.name} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '150px' }} 
          />
          <input 
            type="text" name="sku" placeholder="SKU Code" required
            value={formData.sku} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '100px' }} 
            disabled={editingId !== null} // Usually, SKUs shouldn't change after creation
            title={editingId ? "SKU cannot be changed" : ""}
          />
          <input 
            type="number" step="0.01" name="price" placeholder="Price ($)" required
            value={formData.price} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '80px' }} 
          />
          <input 
            type="number" name="stock_quantity" placeholder="Stock Qty" required
            value={formData.stock_quantity} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '80px' }} 
          />
          
          {/* Dynamic Buttons based on State */}
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: editingId ? '#3498db' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? 'Update Product' : '+ Add Product'}
          </button>
          
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel
            </button>
          )}
        </form>
      </div>
      
      {/* PRODUCT TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>SKU</th>
            <th style={{ padding: '12px' }}>Price</th>
            <th style={{ padding: '12px' }}>Stock</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{product.id}</td>
              <td style={{ padding: '12px', fontWeight: '500' }}>{product.name}</td>
              <td style={{ padding: '12px' }}>{product.sku}</td>
              <td style={{ padding: '12px' }}>${product.price.toFixed(2)}</td>
              <td style={{ padding: '12px', color: product.stock_quantity < 5 ? 'red' : 'black', fontWeight: 'bold' }}>
                {product.stock_quantity}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {/* NEW EDIT BUTTON */}
                <button 
                  onClick={() => handleEdit(product)}
                  style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Products;
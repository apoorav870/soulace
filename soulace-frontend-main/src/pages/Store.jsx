import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Store.css'

const Store = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', category: '' })

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    try {
      const params = {}
      if (filter.type) params.type = filter.type
      if (filter.category) params.category = filter.category

      const response = await axios.get(`${API_BASE_URL}/api/products`, { params })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="store-page">
        <div className="container">
          <div className="loading">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="store-page">
      <div className="container">
        <div className="store-header">
          <h1>Mental Health E-Store</h1>
          <p>Curated books and audiobooks recommended by mental health professionals</p>
        </div>

        <div className="store-filters">
          <div className="filter-group">
            <label>Type:</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="book">Books</option>
              <option value="audiobook">Audiobooks</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="self-help">Self-Help</option>
              <option value="therapy">Therapy</option>
              <option value="meditation">Meditation</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.title} />
                ) : (
                  <div className="product-placeholder">
                    {product.type === 'audiobook' ? '🎧' : '📚'}
                  </div>
                )}
              </div>

              <div className="product-info">
                <div className="product-header-badges">
                  <div className="product-type-badge">
                    {product.type === 'audiobook' ? 'Audiobook' : 'Book'}
                  </div>
                  {product.recommendedBy?.length > 0 && (
                    <div className="product-recommended-badge">
                      ⭐ Recommended
                    </div>
                  )}
                </div>
                <h3 className="product-title">{product.title}</h3>
                <p className="product-author">by {product.author}</p>
                {product.type === 'audiobook' && product.duration && (
                  <div className="product-duration">
                    🎧 {product.duration}
                  </div>
                )}
                <p className="product-description">{product.description}</p>
                <div className="product-category">
                  <span className="category-label">Category:</span>
                  <span className="category-value">{product.category}</span>
                </div>
                <div className="product-footer">
                  <div className="product-price">${product.price}</div>
                  <button className="btn btn-primary">Purchase</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="no-products">
            <div className="no-products-icon">📚✨</div>
            <h3>We're curating something special for you</h3>
            <p>Our collection is growing! Check back soon for carefully selected resources to support your mental health journey.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Store


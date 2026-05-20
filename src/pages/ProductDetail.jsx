import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { products as staticProducts } from '../data/staticData';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../context/StoreContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const productsContext = useProducts();
  const products = productsContext.records;
  const { dispatch } = useCart();

  // Get product from cache or static data
  const product = products.find(p => p.id === +id) || staticProducts.find(p => p.id === +id);

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  if (!product) return (
    <div style={{ paddingTop: 120, textAlign: 'center' }}>
      <p>المنتج غير موجود</p>
      <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>العودة للمنتجات</Link>
    </div>
  );

  const handleAdd = () => {
    if (!selectedSize) { setError('يرجى اختيار المقاس'); return; }
    dispatch({
      type: 'ADD_ITEM',
      item: {
        productId: product.id,
        name: product.name,
        image: product.images[0],
        color: product.colors[selectedColor],
        size: selectedSize,
        price: product.price,
        quantity,
      }
    });
    setAdded(true);
    setError('');
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="product-detail" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <ArrowRight size={14} />
          <Link to="/products">المنتجات</Link>
          <ArrowRight size={14} />
          <span>{product.name}</span>
        </div>

        <div className="product-detail__grid">
          {/* Images */}
          <div className="product-detail__images">
            <div className="product-detail__main-img">
              <img src={product.images[imgIdx]} alt={product.name} />
              {product.images.length > 1 && (
                <>
                  <button className="product-detail__img-nav prev" onClick={() => setImgIdx(i => Math.max(0, i - 1))}>
                    <ChevronRight size={20} />
                  </button>
                  <button className="product-detail__img-nav next" onClick={() => setImgIdx(i => Math.min(product.images.length - 1, i + 1))}>
                    <ChevronLeft size={20} />
                  </button>
                </>
              )}
            </div>
            <div className="product-detail__thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`product-detail__thumb ${imgIdx === i ? 'active' : ''}`}
                  onClick={() => setImgIdx(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <div className="product-detail__badges">
              {product.isNew && <span className="badge">جديد</span>}
              {product.isBestseller && <span className="badge" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>الأكثر طلباً</span>}
            </div>

            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__sku">رقم المنتج: {product.sku}</p>
            <div className="product-detail__price">{product.price.toLocaleString()} دج</div>

            <div className="product-detail__section">
              <h3>الخامة</h3>
              <p>{product.fabric}</p>
            </div>

            <div className="product-detail__section">
              <h3>الوصف</h3>
              <p>{product.description}</p>
            </div>

            {/* Color */}
            <div className="product-detail__section">
              <h3>اختاري اللون</h3>
              <div className="product-detail__colors">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    className={`product-detail__color ${selectedColor === i ? 'active' : ''}`}
                    style={{ background: c === '#fff' ? 'white' : c, border: c === '#fff' ? '1px solid #ddd' : 'none' }}
                    onClick={() => setSelectedColor(i)}
                  >
                    {selectedColor === i && <Check size={14} color={c === '#fff' || c === '#c9a84c' ? '#333' : 'white'} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="product-detail__section">
              <h3>اختاري المقاس</h3>
              <div className="product-detail__sizes">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`product-detail__size ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => { setSelectedSize(size); setError(''); }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {error && <p className="product-detail__error">{error}</p>}
            </div>

            {/* Quantity */}
            <div className="product-detail__section">
              <h3>الكمية</h3>
              <div className="product-detail__qty">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>

            {/* CTA */}
            <button
              className={`product-detail__add-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
            >
              <ShoppingCart size={20} />
              {added ? 'تمت الإضافة للسلة ✓' : 'إضافة إلى السلة'}
            </button>

            <div className="product-detail__meta">
              <span>✦ متوفر: {product.stock} قطعة</span>
              <span>✦ شحن لجميع الولايات</span>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 className="section-title" style={{ marginBottom: 24 }}>منتجات مشابهة</h2>
            <div className="products-grid">
              {related.map(p => (
                <div key={p.id} className="product-card" onClick={() => window.location = `/products/${p.id}`} style={{ cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{p.price.toLocaleString()} دج</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

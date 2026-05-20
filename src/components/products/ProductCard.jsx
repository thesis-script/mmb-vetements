import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_ITEM',
      item: {
        productId: product.id,
        name: product.name,
        image: product.images[0],
        color: product.colors[0],
        size: 'M',
        price: product.price,
        quantity: 1,
      }
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__img-wrap">
        <img src={product.images[0]} alt={product.name} className="product-card__img" loading="lazy" />
        <div className="product-card__overlay">
          <Link to={`/products/${product.id}`} className="product-card__overlay-btn" title="عرض التفاصيل">
            <Eye size={18} />
          </Link>
        </div>
        <div className="product-card__badges">
          {product.isNew && <span className="product-card__badge product-card__badge--new">جديد</span>}
          {product.isBestseller && <span className="product-card__badge product-card__badge--hot">الأكثر طلباً</span>}
        </div>
        <button
          className={`product-card__like ${liked ? 'liked' : ''}`}
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
        >
          <Heart size={16} fill={liked ? '#c97b8a' : 'none'} stroke={liked ? '#c97b8a' : 'currentColor'} />
        </button>
      </Link>

      <div className="product-card__body">
        <div className="product-card__colors">
          {product.colors.slice(0, 4).map((c, i) => (
            <span key={i} className="product-card__color-dot" style={{ background: c === '#fff' ? 'white' : c, border: c === '#fff' ? '1px solid #ddd' : 'none' }} />
          ))}
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <p className="product-card__fabric">{product.fabric}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{product.price.toLocaleString()} دج</span>
          <button
            className={`product-card__add-btn ${added ? 'added' : ''}`}
            onClick={handleQuickAdd}
          >
            <ShoppingCart size={16} />
            <span>{added ? 'تمت الإضافة ✓' : 'إضافة للسلة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

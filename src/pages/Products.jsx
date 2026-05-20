import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, Grid2X2 } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { products as staticProducts, categories } from '../data/staticData';
import { useProducts } from '../context/StoreContext';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'الافتراضي' },
  { value: 'price_asc', label: 'السعر: من الأرخص' },
  { value: 'price_desc', label: 'السعر: من الأغلى' },
  { value: 'new', label: 'الأحدث' },
  { value: 'popular', label: 'الأكثر طلباً' },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const productsContext = useProducts();
  const products = productsContext.records;
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('default');
  const [cols, setCols] = useState(4);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 20000]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCat !== 'all') list = list.filter(p => p.category === selectedCat);
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'new') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sort === 'popular') list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    return list;
  }, [products, selectedCat, sort, priceRange]);

  return (
    <div className="products-page" style={{ paddingTop: '96px', paddingBottom: '80px' }}>
      <div className="container">
        {/* Header */}
        <div className="products-page__header">
          <div>
            <h1 className="section-title">المنتجات الجاهزة</h1>
            <p style={{ color: 'var(--gray-text)', marginTop: 8, fontSize: 14 }}>
              {filtered.length} منتج متاح
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="products-page__cats">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`products-page__cat-btn ${selectedCat === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="products-page__toolbar">
          <button
            className="products-page__filter-btn"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <SlidersHorizontal size={16} />
            تصفية
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="products-page__sort"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="products-page__view-toggle">
              <button className={cols === 4 ? 'active' : ''} onClick={() => setCols(4)}>
                <Grid3X3 size={16} />
              </button>
              <button className={cols === 2 ? 'active' : ''} onClick={() => setCols(2)}>
                <Grid2X2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>نطاق السعر (دج)</label>
              <div className="filter-range">
                <input type="range" min={0} max={20000} step={500}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, +e.target.value])}
                />
                <div className="filter-range-vals">
                  <span>0 دج</span>
                  <span>{priceRange[1].toLocaleString()} دج</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className={`products-grid products-grid--${cols}`}>
          {filtered.length > 0
            ? filtered.map(p => <ProductCard key={p.id} product={p} />)
            : <div className="products-page__empty">لا توجد منتجات في هذا التصنيف حالياً</div>
          }
        </div>
      </div>
    </div>
  );
}

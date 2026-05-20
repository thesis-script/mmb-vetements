import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Package, ShoppingBag, Scissors, Users, Settings, Menu, X,
  TrendingUp, Edit2, Trash2, Plus, LogOut, Eye, Save, AlertCircle,
  Upload, RotateCcw, AlertTriangle, ChevronDown, ChevronUp,
  Truck
} from 'lucide-react';
import { useProducts, useOrders, useDesignOrders } from '../context/StoreContext';
import { processImageFile } from '../utils/imageStorage';
import { storageUsageKB } from '../utils/storage';
import AuthManager from '../utils/auth';
import { categories, wilayas } from '../data/staticData';
import './Admin.css';

// Define the navigation items (main links only)
const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <BarChart2 size={18} /> },
  { id: 'products', label: 'المنتجات', icon: <Package size={18} /> },
  { id: 'orders', label: 'الطلبات الجاهزة', icon: <ShoppingBag size={18} /> },
  { id: 'design_orders', label: 'طلبات التصميم', icon: <Scissors size={18} /> },
  { id: 'custom_details', label: 'شراء بالتفاصيل', icon: <Tag size={18} /> },
  { id: 'customers', label: 'الزبائن', icon: <Users size={18} /> },
  { id: 'reports', label: 'التقارير', icon: <FileText size={18} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} /> },
];

// Import missing icons
import { Tag, Palette, List, Clock, Info, FileText, Folder, DollarSign, History, MapPin, CreditCard } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', color: '#f39c12' },
  confirmed: { label: 'مؤكد', color: '#27ae60' },
  reviewed: { label: 'تم المراجعة', color: '#3498db' },
  shipped: { label: 'جاري الشحن', color: '#9b59b6' },
  cancelled: { label: 'ملغي', color: '#e74c3c' },
};

const EMPTY_PRODUCT = {
  name: '', sku: '', category: 'dresses', price: '', fabric: '',
  description: '', stock: '', isBestseller: false, isNew: false,
  colors: [], sizes: [], images: [],
};

// ── Login ─────────────────────────────────────────────────────────────────────

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (AuthManager.login(email, password)) {
      onLoginSuccess();
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="admin-login">
        <div className="admin-login__card">
          <div className="admin-login__header">
            <h1>لوحة تحكم MMB</h1>
            <p>تسجيل الدخول كمسؤول</p>
          </div>
          <form onSubmit={handleLogin} className="admin-login__form">
            {error && (
              <div className="admin-login__error">
                <AlertCircle size={18} /><span>{error}</span>
              </div>
            )}
            <div className="form-field">
              <label>البريد الإلكتروني</label>
              <input type="email" placeholder="admin@gmail.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>كلمة المرور</label>
              <input type="password" placeholder="••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Storage Usage Indicator ───────────────────────────────────────────────────

function StorageUsage() {
  const usedKB = parseFloat(storageUsageKB());
  const maxKB = 5120; // ~5 MB localStorage limit
  const pct = Math.min((usedKB / maxKB) * 100, 100).toFixed(1);
  const color = usedKB > 3000 ? '#e74c3c' : usedKB > 1500 ? '#f39c12' : '#27ae60';

  return (
    <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--gray-text)', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>التخزين المحلي</span>
        <span style={{ color }}>{usedKB} KB / 5 MB</span>
      </div>
      <div style={{ background: 'var(--border-color)', borderRadius: 4, height: 4 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: '100%', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthManager.isAuthenticated());
  const navigate = useNavigate();

  // ── NEW: typed hooks instead of useCache() ────────────────────────────────
  const {
    records: products,
    error: productError,
    create: createProduct,
    update: updateProduct,
    softDelete: deleteProduct,
    restore: restoreProduct,
    hardDelete: permanentDeleteProduct,
  } = useProducts();

  // For the trash tab, we need ALL records including deleted ones.
  // We use a separate hook instance with includeDeleted: true.
  // NOTE: This pattern is intentional — the trash view is a separate concern.
  const {
    records: allProductsWithDeleted,
    refresh: refreshAllProducts,
  } = useProducts();
  // (We'd need useRepository(ProductRepo, { includeDeleted: true }) for this —
  //  since StoreContext wraps that, we re-read from repo directly here)
  const [trashedProducts, setTrashedProducts] = useState([]);

  const {
    records: orders,
    error: orderError,
    update: updateOrder,
  } = useOrders();

  const {
    records: designOrders,
    error: designError,
    update: updateDesignOrder,
    softDelete: deleteDesignOrder,
  } = useDesignOrders();

  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [shippingConfig, setShippingConfig] = useState(() => {
    try {
      const raw = localStorage.getItem('mmb_shipping_config');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mmb_shipping_config', JSON.stringify(shippingConfig));
    } catch (e) {}
  }, [shippingConfig]);

  // Product form state
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Design order modal
  const [viewingDesignImage, setViewingDesignImage] = useState(null);

  // Load trashed products when trash tab is active
  useEffect(() => {
    if (active === 'trash') {
      const { ProductRepo } = require('../utils/repositories');
      const all = ProductRepo.getAll({ includeDeleted: true });
      setTrashedProducts(all.filter((p) => p.isDeleted));
    }
  }, [active, products]); // re-run when products changes (after restore)

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // ── Product CRUD handlers ─────────────────────────────────────────────────

  const handleEditProduct = (p) => {
    setEditingProduct(p.id);
    setProductForm({ ...EMPTY_PRODUCT, ...p });
    setShowProductForm(true);
    setImageError('');
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setShowProductForm(true);
    setImageError('');
  };

  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setImageError('');
  };

  const handleSaveProduct = () => {
    const data = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };

    if (!data.name.trim() || !data.sku.trim()) {
      alert('اسم المنتج والكود مطلوبان');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct, data);
    } else {
      createProduct(data);
    }

    handleCancelForm();
  };

  // ── Image upload with compression ─────────────────────────────────────────

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError('');
    try {
      const compressed = await processImageFile(file);
      setProductForm((prev) => ({
        ...prev,
        images: [compressed, ...prev.images.filter((img) => img !== compressed)],
      }));
    } catch (err) {
      setImageError(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  // ── Order handlers ────────────────────────────────────────────────────────

  const handleChangeOrderStatus = (orderId, status) => {
    updateOrder(orderId, { status });
  };

  const handleUpdateDesignStatus = (orderId, status) => {
    updateDesignOrder(orderId, { status });
  };

  const handleShippingConfigChange = (wilayaId, value) => {
    setShippingConfig((prev) => ({
      ...prev,
      [wilayaId]: value === '' ? '' : Number(value),
    }));
  };

  const handleSaveShippingConfig = () => {
    try {
      localStorage.setItem('mmb_shipping_config', JSON.stringify(shippingConfig));
    } catch (e) {
      console.error('Unable to save shipping config', e);
    }
  };

  // ── Soft delete / restore ─────────────────────────────────────────────────

  const handleDeleteProduct = (id) => {
    if (window.confirm('سيتم نقل المنتج إلى المحذوفات. يمكنك استعادته لاحقاً.')) {
      deleteProduct(id);
    }
  };

  const handleRestoreProduct = (id) => {
    restoreProduct(id);
    // Refresh trashed list
    const { ProductRepo } = require('../utils/repositories');
    setTrashedProducts(ProductRepo.getAll({ includeDeleted: true }).filter((p) => p.isDeleted));
  };

  const handlePermanentDelete = (id) => {
    if (window.confirm('هذا الإجراء نهائي ولا يمكن التراجع عنه. هل أنت متأكد؟')) {
      permanentDeleteProduct(id);
      setTrashedProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // ── Dashboard stats ───────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const allCustomers = new Set(orders.map((o) => o.customer || o.name)).size;
  const customDesignOrders = designOrders.filter((order) => !order.orderType || order.orderType === 'custom');
  const customDetailsOrders = designOrders.filter((order) => order.orderType === 'details');

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-logo">
            <img style={{width:'50px', height:'50px'}} src="/logo.png" alt="Admin Logo" />
          </div>
          <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-nav__item ${active === item.id ? 'admin-nav__item--active' : ''}`}
              onClick={() => {
                setActive(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <StorageUsage />

        <button className="admin-nav__item admin-logout" onClick={() => { AuthManager.logout(); setIsAuthenticated(false); }}>
          <LogOut size={18} /><span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="admin-header__menu" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="admin-header__title">
            {NAV_ITEMS.find((n) => n.id === active)?.label}
          </div>
        </header>

        {/* Global error banner */}
        {(productError || orderError || designError) && (
          <div style={{ margin: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, display: 'flex', gap: 8, color: '#dc2626', fontSize: 14 }}>
            <AlertTriangle size={18} />
            {productError || orderError || designError}
          </div>
        )}

        {/* ── Content based on active main menu ── */}
        {active === 'dashboard' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">لوحة التحكم</h2>
            <div className="admin-stats">
              {[
                { label: 'إجمالي المنتجات', value: products.length, icon: <Package size={22} /> },
                { label: 'الطلبات', value: orders.length, icon: <ShoppingBag size={22} /> },
                { label: 'طلبات التصميم', value: designOrders.length, icon: <Scissors size={22} /> },
                { label: 'الزبائن', value: allCustomers, icon: <Users size={22} /> },
                { label: 'الإيرادات', value: `${totalRevenue.toLocaleString()} دج`, icon: <TrendingUp size={22} /> },
              ].map((stat) => (
                <div key={stat.label} className="admin-stat-card">
                  <div className="admin-stat-card__icon">{stat.icon}</div>
                  <div>
                    <div className="admin-stat-card__value">{stat.value}</div>
                    <div className="admin-stat-card__label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-section" style={{ marginTop: 32 }}>
              <h3>أحدث الطلبات</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>رقم الطلب</th><th>العميل</th><th>الولاية</th><th>المبلغ</th><th>الحالة</th></tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong></td>
                      <td>{order.customer || order.name}</td>
                      <td>{order.wilaya}</td>
                      <td><strong style={{ color: 'var(--gold-dark)' }}>{(order.total || 0).toLocaleString()} دج</strong></td>
                      <td>{STATUS_MAP[order.status]?.label || order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-section" style={{ marginTop: 32 }}>
              <h3>أحدث الزبائن</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>الاسم</th><th>الهاتف</th><th>الولاية</th><th>عدد الطلبات</th></tr>
                </thead>
                <tbody>
                  {[...new Set(orders.map((o) => o.customer || o.name))].slice(0, 10).map((customer, i) => {
                    const customerOrders = orders.filter((o) => (o.customer || o.name) === customer);
                    const last = customerOrders[0];
                    return (
                      <tr key={i}>
                        <td>{customer}</td>
                        <td>{last?.phone || '-'}</td>
                        <td>{last?.wilaya || '-'}</td>
                        <td><strong>{customerOrders.length}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'products' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="admin-title" style={{ margin: 0 }}>المنتجات</h2>
              <button className="btn-primary" onClick={handleNewProduct}><Plus size={16} /> إضافة منتج</button>
            </div>
            {showProductForm && (
              <div className="admin-form-card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>{editingProduct ? 'تعديل المنتج' : 'منتج جديد'}</h3>
                <div className="admin-form-grid">
                  {[
                    { label: 'اسم المنتج', key: 'name', type: 'text' },
                    { label: 'كود المنتج', key: 'sku', type: 'text' },
                    { label: 'السعر (دج)', key: 'price', type: 'number' },
                    { label: 'المخزون', key: 'stock', type: 'number' },
                    { label: 'القماش', key: 'fabric', type: 'text' },
                  ].map((f) => (
                    <div key={f.key} className="form-field">
                      <label>{f.label}</label>
                      <input type={f.type} value={productForm[f.key]}
                        onChange={(e) => setProductForm({ ...productForm, [f.key]: e.target.value })} />
                    </div>
                  ))}
                  <div className="form-field">
                    <label>الفئة</label>
                    <select value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                      {categories.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>صورة المنتج</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: '1px dashed var(--border-color)', borderRadius: 8, fontSize: 13 }}>
                      <Upload size={16} />
                      {imageUploading ? 'جاري الرفع...' : 'رفع صورة'}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={handleImageUpload} disabled={imageUploading} />
                    </label>
                    {imageError && (
                      <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{imageError}</span>
                    )}
                    {productForm.images?.[0] && (
                      <img src={productForm.images[0]} alt="preview"
                        style={{ width: 80, height: 96, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                    )}
                  </div>
                  <div className="form-field form-field--full">
                    <label>الوصف</label>
                    <textarea value={productForm.description} rows={3}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button className="btn-primary" onClick={handleSaveProduct}><Save size={16} /> حفظ</button>
                  <button className="btn-secondary" onClick={handleCancelForm}><X size={16} /> إلغاء</button>
                </div>
              </div>
            )}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الصورة</th><th>الاسم</th><th>الكود</th><th>التصنيف</th>
                  <th>السعر</th><th>المخزون</th><th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.images?.[0] || 'https://via.placeholder.com/50x60'}
                        alt={p.name} style={{ width: 50, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                    </td>
                    <td><strong>{p.name}</strong></td>
                    <td style={{ color: 'var(--gray-text)', fontSize: 13 }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td><strong style={{ color: 'var(--gold-dark)' }}>{p.price?.toLocaleString()} دج</strong></td>
                    <td>{p.stock}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn-edit" onClick={() => handleEditProduct(p)}><Edit2 size={14} /> تعديل</button>
                        <button className="admin-btn-delete" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={14} /> حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-section" style={{ marginTop: 32 }}>
              <h3>التصنيفات</h3>
              <div className="admin-categories-grid">
                {categories.filter((c) => c.id !== 'all').map((cat) => (
                  <div key={cat.id} className="admin-category-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.2em' }}>{cat.icon}</span>
                      <div>
                        <h4 style={{ margin: 0 }}>{cat.name}</h4>
                        <p style={{ margin: 0, color: 'var(--gray-text)', fontSize: '0.9em' }}>{cat.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'orders' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">الطلبات ({orders.length})</h2>
            <div className="admin-section" style={{ marginBottom: 24 }}>
              <h3>ملخص الطلبات</h3>
              <div className="admin-stats">
                {[{
                  label: 'إجمالي الطلبات', value: orders.length, icon: <ShoppingBag size={22} />
                }, {
                  label: 'الطلبات المعلقة', value: pendingOrders, icon: <AlertCircle size={22} />
                }, {
                  label: 'الطلبات المشحونة', value: orders.filter((o) => o.status === 'shipped').length, icon: <Truck size={22} />
                }].map((stat) => (
                  <div key={stat.label} className="admin-stat-card">
                    <div className="admin-stat-card__icon">{stat.icon}</div>
                    <div>
                      <div className="admin-stat-card__value">{stat.value}</div>
                      <div className="admin-stat-card__label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>البريد</th><th>الولاية</th><th>العنوان</th><th>طريقة الدفع</th><th>NIF</th><th>NIS</th><th>المبلغ</th><th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer || order.name}</td>
                    <td>{order.phone}</td>
                    <td>{order.email || '-'}</td>
                    <td>{order.wilaya}</td>
                    <td>{order.address || '-'}</td>
                    <td>{order.payment || '-'}</td>
                    <td>{order.nif || '-'}</td>
                    <td>{order.nis || '-'}</td>
                    <td><strong style={{ color: 'var(--gold-dark)' }}>{(order.total || 0).toLocaleString()} دج</strong></td>
                    <td>
                      <select className="admin-status-select" value={order.status}
                        onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}>
                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'design_orders' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">طلبات التصميم ({customDesignOrders.length})</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>البريد</th><th>الولاية</th><th>العنوان</th><th>NIF</th><th>NIS</th><th>نوع اللباس</th><th>القماش</th><th>الكمية</th><th>الصدر</th><th>الخصر</th><th>الأرداف</th><th>الطول</th><th>طرز</th><th>صورة الطرز</th><th>شعار العميل</th><th>صورة مرجعية</th><th>الوصف</th><th>الملاحظات</th><th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {customDesignOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer || order.name}</td>
                    <td>{order.phone}</td>
                    <td>{order.email || '-'}</td>
                    <td>{order.wilaya}</td>
                    <td>{order.address || '-'}</td>
                    <td>{order.nif || '-'}</td>
                    <td>{order.nis || '-'}</td>
                    <td>{order.clothingType || '-'}</td>
                    <td>{order.fabric || '-'}</td>
                    <td>{order.quantity || '-'}</td>
                    <td>{order.chest || '-'}</td>
                    <td>{order.waist || '-'}</td>
                    <td>{order.hips || '-'}</td>
                    <td>{order.length || '-'}</td>
                    <td>{order.tarzOption === 'with' ? 'بالطرز' : 'بدون طرز'}</td>
                    <td>
                      {order.tarzImage ? (
                        <button className="admin-btn-view" onClick={() => setViewingDesignImage(order.tarzImage)}>
                          <Eye size={14} /> عرض
                        </button>
                      ) : <span style={{ color: 'var(--gray-text)' }}>-</span>}
                    </td>
                    <td>
                      {order.logo ? (
                        <button className="admin-btn-view" onClick={() => setViewingDesignImage(order.logo)}>
                          <Eye size={14} /> عرض
                        </button>
                      ) : <span style={{ color: 'var(--gray-text)' }}>-</span>}
                    </td>
                    <td>
                      {order.image ? (
                        <button className="admin-btn-view" onClick={() => setViewingDesignImage(order.image)}>
                          <Eye size={14} /> عرض
                        </button>
                      ) : <span style={{ color: 'var(--gray-text)' }}>-</span>}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.description || '-'}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.notes || '-'}</td>
                    <td>
                      <select className="admin-status-select" value={order.status}
                        onChange={(e) => handleUpdateDesignStatus(order.id, e.target.value)}>
                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'custom_details' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">طلبات الشراء بالتفاصيل ({customDetailsOrders.length})</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>البريد</th><th>الولاية</th><th>العنوان</th><th>نوع اللباس</th><th>القماش</th><th>الكمية</th><th>الصدر</th><th>الخصر</th><th>الأرداف</th><th>الطول</th><th>طرز</th><th>صورة الطرز</th><th>صورة مرجعية</th><th>الوصف</th><th>الملاحظات</th><th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {customDetailsOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer || order.name}</td>
                    <td>{order.phone}</td>
                    <td>{order.email || '-'}</td>
                    <td>{order.wilaya}</td>
                    <td>{order.address || '-'}</td>
                    <td>{order.clothingType || '-'}</td>
                    <td>{order.fabric || '-'}</td>
                    <td>{order.quantity || '-'}</td>
                    <td>{order.chest || '-'}</td>
                    <td>{order.waist || '-'}</td>
                    <td>{order.hips || '-'}</td>
                    <td>{order.length || '-'}</td>
                    <td>{order.tarzOption === 'with' ? 'بالطرز' : 'بدون طرز'}</td>
                    <td>
                      {order.tarzImage ? (
                        <button className="admin-btn-view" onClick={() => setViewingDesignImage(order.tarzImage)}>
                          <Eye size={14} /> عرض
                        </button>
                      ) : <span style={{ color: 'var(--gray-text)' }}>-</span>}
                    </td>
                    <td>
                      {order.image ? (
                        <button className="admin-btn-view" onClick={() => setViewingDesignImage(order.image)}>
                          <Eye size={14} /> عرض
                        </button>
                      ) : <span style={{ color: 'var(--gray-text)' }}>-</span>}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.description || '-'}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.notes || '-'}</td>
                    <td>
                      <select className="admin-status-select" value={order.status}
                        onChange={(e) => handleUpdateDesignStatus(order.id, e.target.value)}>
                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'customers' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">الزبائن ({allCustomers})</h2>
            <table className="admin-table">
              <thead>
                <tr><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>الولاية</th><th>عدد الطلبات</th></tr>
              </thead>
              <tbody>
                {[...new Set(orders.map((o) => o.customer || o.name))].map((customer, i) => {
                  const customerOrders = orders.filter((o) => (o.customer || o.name) === customer);
                  const last = customerOrders[0];
                  return (
                    <tr key={i}>
                      <td>{customer}</td>
                      <td>{last?.phone || '-'}</td>
                      <td>{last?.email || '-'}</td>
                      <td>{last?.wilaya || '-'}</td>
                      <td><strong>{customerOrders.length}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {active === 'reports' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">التقارير</h2>
            <div className="admin-stats">
              {[
                { label: 'إجمالي المبيعات', value: `${totalRevenue.toLocaleString()} دج`, icon: <TrendingUp size={22} /> },
                { label: 'إجمالي الطلبات', value: orders.length, icon: <Package size={22} /> },
                { label: 'الطلبات المنجزة', value: orders.filter((o) => o.status === 'shipped').length, icon: <Truck size={22} /> },
              ].map((stat) => (
                <div key={stat.label} className="admin-stat-card">
                  <div className="admin-stat-card__icon">{stat.icon}</div>
                  <div>
                    <div className="admin-stat-card__value">{stat.value}</div>
                    <div className="admin-stat-card__label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-section" style={{ marginTop: 24 }}>
              <h3>تفاصيل الطلبات حسب الحالة</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>الحالة</th><th>عدد الطلبات</th></tr>
                </thead>
                <tbody>
                  {Object.entries(STATUS_MAP).map(([key, stat]) => (
                    <tr key={key}>
                      <td>{stat.label}</td>
                      <td>{orders.filter((o) => o.status === key).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'settings' && (
          <div className="admin-content" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 className="admin-title">الإعدادات</h2>
            <div className="admin-form-card">
              <h3>معلومات المتجر</h3>
              <div className="admin-form-grid">
                <div className="form-field">
                  <label>اسم المتجر</label>
                  <input type="text" defaultValue="MMB Fashion Store" />
                </div>
                <div className="form-field">
                  <label>البريد الإلكتروني</label>
                  <input type="email" defaultValue="contact@mmb-fashion.dz" />
                </div>
                <div className="form-field">
                  <label>رقم الهاتف</label>
                  <input type="tel" defaultValue="+213 555 123 456" />
                </div>
                <div className="form-field form-field--full">
                  <label>العنوان</label>
                  <textarea rows={2} defaultValue="شارع محمد بوضياف، الجزائر العاصمة"></textarea>
                </div>
              </div>
            </div>
            <div className="admin-form-card" style={{ marginTop: 24 }}>
              <h3>طرق الدفع</h3>
              <div className="admin-payment-methods">
                <div className="admin-payment-method">
                  <label className="checkbox-container">
                    <input type="checkbox" defaultChecked />
                    <span className="checkmark"></span>
                    <span>الدفع عند الاستلام</span>
                  </label>
                </div>
                <div className="admin-payment-method">
                  <label className="checkbox-container">
                    <input type="checkbox" defaultChecked />
                    <span className="checkmark"></span>
                    <span>التحويل البنكي</span>
                  </label>
                </div>
                <div className="admin-payment-method">
                  <label className="checkbox-container">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    <span>الدفع عبر الهاتف</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-form-card" style={{ marginTop: 24 }}>
              <h3>إعدادات الشحن</h3>
              <div className="admin-form-grid">
                {wilayas.map((wilaya) => (
                  <div key={wilaya} className="form-field">
                    <label>{wilaya}</label>
                    <input type="number" min="0"
                      value={shippingConfig[wilaya] ?? ''}
                      onChange={(e) => handleShippingConfigChange(wilaya, e.target.value)}
                      placeholder="سعر الشحن" />
                  </div>
                ))}
                <div className="form-field form-field--full">
                  <button className="btn-primary" onClick={handleSaveShippingConfig} style={{ width: '100%' }}><Save size={16} /> حفظ إعدادات الشحن</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design image modal */}
        {viewingDesignImage && (
          <div className="admin-modal" onClick={() => setViewingDesignImage(null)}>
            <div className="admin-modal__content" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal__close" onClick={() => setViewingDesignImage(null)}><X size={20} /></button>
              <img src={viewingDesignImage} alt="تصميم" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
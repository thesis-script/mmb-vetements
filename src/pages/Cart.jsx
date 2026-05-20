import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../context/StoreContext';
import { wilayas } from '../data/staticData';
import './Cart.css';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'الدفع عند الاستلام' },
  { id: 'bank', label: 'تحويل بنكي' },
  { id: 'card', label: 'بطاقة بنكية' },
];

export default function Cart() {
  const { items, total, dispatch } = useCart();
  const { create: createOrder } = useOrders();
  const [step, setStep] = useState(1); // 1=cart, 2=checkout, 3=confirm
  const [form, setForm] = useState({ name: '', phone: '', email: '', wilaya: '', address: '', payment: 'cash', nif: '', nis: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!form.phone.trim()) e.phone = 'الهاتف مطلوب';
    if (!form.email.trim()) e.email = 'البريد مطلوب';
    if (!form.wilaya) e.wilaya = 'الولاية مطلوبة';
    if (!form.address.trim()) e.address = 'العنوان مطلوب';
    if (!form.nif.trim()) e.nif = 'رقم التعريف الضريبي مطلوب';
    if (!form.nis.trim()) e.nis = 'رقم السجل التجاري مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const order = {
      id: 'ORD-' + Date.now(),
      customer: form.name,
      name: form.name,
      phone: form.phone,
      email: form.email,
      wilaya: form.wilaya,
      address: form.address,
      payment: form.payment,
      nif: form.nif,
      nis: form.nis,
      items,
      total,
      date: new Date().toLocaleDateString('ar-DZ'),
      status: 'pending',
    };

    const created = createOrder(order);
    if (!created) return;
    dispatch({ type: 'CLEAR' });
    setStep(3);
  };

  if (step === 3) return (
    <div className="cart-page" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        <div className="cart-success">
          <div className="cart-success__icon">✓</div>
          <h2>تم تأكيد طلبك بنجاح!</h2>
          <p>سيتم التواصل معكِ قريباً لتأكيد التفاصيل وتحديد موعد التسليم.</p>
          <Link to="/products" className="btn-primary">مواصلة التسوق</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 32 }}>
          {step === 1 ? 'سلة الطلبات' : 'إتمام الطلب'}
        </h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={60} />
            <h3>سلتكِ فارغة</h3>
            <p>لم تضيفي أي منتج بعد</p>
            <Link to="/products" className="btn-primary">ابدئي التسوق</Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-main">
              {step === 1 ? (
                <>
                  {items.map((item, idx) => (
                    <div key={idx} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item__img" />
                      <div className="cart-item__info">
                        <h3>{item.name}</h3>
                        <div className="cart-item__meta">
                          <span className="cart-item__color-dot" style={{ background: item.color === '#fff' ? 'white' : item.color, border: item.color === '#fff' ? '1px solid #ddd' : 'none' }} />
                          <span>مقاس: {item.size}</span>
                        </div>
                        <div className="cart-item__qty">
                          <button onClick={() => dispatch({ type: 'UPDATE_QTY', index: idx, qty: Math.max(1, item.quantity - 1) })}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => dispatch({ type: 'UPDATE_QTY', index: idx, qty: item.quantity + 1 })}>+</button>
                        </div>
                      </div>
                      <div className="cart-item__right">
                        <span className="cart-item__price">{(item.price * item.quantity).toLocaleString()} دج</span>
                        <button className="cart-item__remove" onClick={() => dispatch({ type: 'REMOVE_ITEM', index: idx })}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="checkout-form">
                  <h3>بيانات الزبون</h3>
                  <div className="form-grid">
                    {[
                      { key: 'name', label: 'الاسم الكامل', type: 'text', placeholder: 'أدخلي اسمكِ الكامل' },
                      { key: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '05XX XXX XXX' },
                      { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'example@email.com' },
                    ].map(f => (
                      <div key={f.key} className="form-field">
                        <label>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                        {errors[f.key] && <span className="form-error">{errors[f.key]}</span>}
                      </div>
                    ))}
                    <div className="form-field">
                      <label>الولاية</label>
                      <select value={form.wilaya} onChange={e => setForm(p => ({ ...p, wilaya: e.target.value }))}>
                        <option value="">اختاري الولاية</option>
                        {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      {errors.wilaya && <span className="form-error">{errors.wilaya}</span>}
                    </div>
                    <div className="form-field">
                      <label>رقم التعريف الضريبي (NIF)</label>
                      <input type="text" placeholder="رقم NIF" value={form.nif}
                        onChange={e => setForm(p => ({ ...p, nif: e.target.value }))} />
                      {errors.nif && <span className="form-error">{errors.nif}</span>}
                    </div>
                    <div className="form-field">
                      <label>رقم السجل التجاري (NIS)</label>
                      <input type="text" placeholder="رقم NIS" value={form.nis}
                        onChange={e => setForm(p => ({ ...p, nis: e.target.value }))} />
                      {errors.nis && <span className="form-error">{errors.nis}</span>}
                    </div>
                    <div className="form-field form-field--full">
                      <label>العنوان التفصيلي</label>
                      <input type="text" placeholder="الحي، الشارع، رقم المبنى..." value={form.address}
                        onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                  </div>

                  <h3 style={{ marginTop: 24 }}>طريقة الدفع</h3>
                  <div className="payment-methods">
                    {PAYMENT_METHODS.map(m => (
                      <label key={m.id} className={`payment-method ${form.payment === m.id ? 'active' : ''}`}>
                        <input type="radio" name="payment" value={m.id}
                          checked={form.payment === m.id}
                          onChange={() => setForm(p => ({ ...p, payment: m.id }))} />
                        <span>{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <h3>ملخص الطلب</h3>
              <div className="cart-summary__items">
                {items.map((item, i) => (
                  <div key={i} className="cart-summary__item">
                    <div>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: 13, color: 'var(--gray-text)', marginTop: 4 }}>
                        مقاس: {item.size} &bull; اللون: {item.color} &bull; كمية: {item.quantity}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray-text)', marginTop: 4 }}>
                        سعر الوحدة: {item.price.toLocaleString()} دج
                      </div>
                    </div>
                    <span>{(item.price * item.quantity).toLocaleString()} دج</span>
                  </div>
                ))}
              </div>
              <div className="cart-summary__row">
                <span>المجموع الفرعي</span>
                <span>{total.toLocaleString()} دج</span>
              </div>
              <div className="cart-summary__row">
                <span>الشحن</span>
                <span className="text-green">يُحدد لاحقاً</span>
              </div>
              <div className="cart-summary__total">
                <span>المجموع الكلي</span>
                <span>{total.toLocaleString()} دج</span>
              </div>
              {step === 1 ? (
                <button className="btn-primary" style={{ width: '100%', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => setStep(2)}>
                  إتمام الطلب <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleSubmit}>
                  تأكيد الطلب
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

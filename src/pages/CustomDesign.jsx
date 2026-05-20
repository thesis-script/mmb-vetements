import React, { useState, useRef } from 'react';
import { Scissors, Upload, Check } from 'lucide-react';
import { wilayas, fabricTypes, clothingTypes } from '../data/staticData';
import { useDesignOrders } from '../context/StoreContext';
import { useLocation } from 'react-router-dom';
import './CustomDesign.css';

const STEPS = ['معلومات التواصل', 'تفاصيل اللباس', 'تفاصيل التصميم', 'معاينة وإرسال'];

export default function CustomDesign() {
  const designOrders = useDesignOrders();
  const fileInputRef = useRef(null);
  const tarzFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') === 'details' ? 'details' : 'custom';
  const isDetailsMode = mode === 'details';

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', wilaya: '', address: '',
    nif: '', nis: '',
    clothingType: '', fabric: '', quantity: 1,
    chest: '', waist: '', hips: '', length: '',
    colors: [],
    description: '', notes: '', image: null, imagePreview: null,
    tarzOption: 'no', tarzImage: null, tarzImagePreview: null,
    logo: null, logoPreview: null,
  });

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleColor = (c) => {
    setForm(p => ({
      ...p,
      colors: p.colors.includes(c) ? p.colors.filter(x => x !== c) : [...p.colors, c]
    }));
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يتجاوز 5MB');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(p => ({
        ...p,
        image: e.target.result,
        imagePreview: e.target.result,
      }));
      setUploading(false);
    };
    reader.onerror = () => {
      alert('خطأ في تحميل الصورة');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleTarzImageSelect = (file) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يتجاوز 5MB');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(p => ({
        ...p,
        tarzImage: e.target.result,
        tarzImagePreview: e.target.result,
      }));
      setUploading(false);
    };
    reader.onerror = () => {
      alert('خطأ في تحميل صورة الطرز');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };


  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email || !form.wilaya) {
      alert('يرجى ملء جميع معلومات التواصل');
      return;
    }
    if (!isDetailsMode && (!form.nif || !form.nis)) {
      alert('يرجى إضافة NIF و NIS');
      return;
    }
    if (!form.clothingType || !form.fabric) {
      alert('يرجى اختيار نوع اللباس والقماش');
      return;
    }
    if (!form.description) {
      alert('يرجى وصف التصميم');
      return;
    }
    if (form.tarzOption === 'with' && !form.tarzImage) {
      alert('يرجى رفع صورة الطرز');
      return;
    }

    const designOrder = {
      id: 'DSG-' + Date.now(),
      orderType: mode,
      ...form,
      status: 'pending',
      date: new Date().toLocaleDateString('ar-DZ'),
      customer: form.name,
    };

    designOrders.create(designOrder);
    setSubmitted(true);
  };

  const canProceed = () => {
    if (step === 0) return form.name && form.phone && form.email && form.wilaya && (isDetailsMode || (form.nif && form.nis));
    if (step === 1) return form.clothingType && form.fabric && form.chest && form.waist && form.hips && form.length;
    if (step === 2) return form.colors.length > 0 && form.description;
    return true;
  };

  const COLORS = ['#1a1410', '#c9a84c', '#c97b8a', '#fff', '#6b5a4e', '#2c3e50', '#e8c97a', '#f5ede6'];

  if (submitted) return (
    <div style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        <div className="cart-success">
          <div className="cart-success__icon">✓</div>
          <h2>تم إرسال طلب التصميم!</h2>
          <p>سيقوم فريق التصميم لدينا بمراجعة طلبكِ وإرسال السعر ومدة الإنجاز في أقرب وقت.</p>
          <button className="btn-primary" onClick={() => { setSubmitted(false); setStep(0); setForm({ name: '', phone: '', email: '', wilaya: '', address: '', clothingType: '', fabric: '', quantity: 1, chest: '', waist: '', hips: '', length: '', colors: [], description: '', notes: '', image: null, imagePreview: null, tarzOption: 'no', tarzImage: null, tarzImagePreview: null }); }}>طلب تصميم آخر</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="custom-design" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        {/* Header */}
        <div className="custom-design__header">
          <div className="custom-design__icon"><Scissors size={32} /></div>
          <div>
            <h1 className="section-title text-center">تصميم حسب الطلب</h1>
            <p style={{ color: 'var(--gray-text)', marginTop: 6, fontSize: 14 }}>
              اطلبي تصميمكِ الحصري بمقاساتكِ ورؤيتكِ الفريدة
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="design-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`design-steps__item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="design-steps__circle">
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="design-form">
          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="form-card ">
              <h3>معلومات التواصل</h3>
              <div className="form-grid">
                {[
                  { key: 'name', label: 'الاسم الكامل', type: 'text', placeholder: 'الاسم الكامل' },
                  { key: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '05XX XXX XXX' },
                  { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'example@email.com' },
                ].map(f => (
                  <div key={f.key} className="form-field">
                    <label>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
                <div className="form-field">
                  <label>الولاية</label>
                  <select value={form.wilaya} onChange={e => update('wilaya', e.target.value)}>
                    <option value="">اختاري الولاية</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                {!isDetailsMode && (
                  <>
                    <div className="form-field">
                      <label>NIF</label>
                      <input type="text" placeholder="رقم التعريف الضريبي" value={form.nif} onChange={e => update('nif', e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>NIS</label>
                      <input type="text" placeholder="رقم السجل التجاري" value={form.nis} onChange={e => update('nis', e.target.value)} />
                    </div>
                  </>
                )}
                <div className="form-field form-field--full">
                  <label>العنوان التفصيلي</label>
                  <input type="text" placeholder="الحي، الشارع..." value={form.address} onChange={e => update('address', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Clothing details */}
          {step === 1 && (
            <div className="form-card">
              <h3>تفاصيل اللباس</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>نوع اللباس</label>
                  <select value={form.clothingType} onChange={e => update('clothingType', e.target.value)}>
                    <option value="">اختاري النوع</option>
                    {clothingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>نوع القماش</label>
                  <select value={form.fabric} onChange={e => update('fabric', e.target.value)}>
                    <option value="">اختاري القماش</option>
                    {fabricTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>الكمية</label>
                  <div className="product-detail__qty" style={{ border: '2px solid rgba(201,168,76,0.2)', borderRadius: 10 }}>
                    <button type="button" onClick={() => update('quantity', Math.max(1, form.quantity - 1))}>-</button>
                    <span>{form.quantity}</span>
                    <button type="button" onClick={() => update('quantity', form.quantity + 1)}>+</button>
                  </div>
                </div>
              </div>

              <h4 style={{ marginTop: 24, marginBottom: 16, fontSize: 14, fontWeight: 700 }}>المقاسات (سم)</h4>
              <div className="form-grid">
                {[
                  { key: 'chest', label: 'الصدر' },
                  { key: 'waist', label: 'الخصر' },
                  { key: 'hips', label: 'الأرداف' },
                  { key: 'length', label: 'الطول' },
                ].map(f => (
                  <div key={f.key} className="form-field">
                    <label>{f.label}</label>
                    <input type="number" placeholder="0 سم" value={form[f.key]} onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Design details */}
          {step === 2 && (
            <div className="form-card">
              <h3>تفاصيل التصميم</h3>

              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>الألوان المطلوبة</label>
                <div className="design-colors">
                  {COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      className={`design-color ${form.colors.includes(c) ? 'active' : ''}`}
                      style={{ background: c, border: c === '#fff' ? '2px solid #ddd' : '2px solid transparent' }}
                      onClick={() => toggleColor(c)}
                    >
                      {form.colors.includes(c) && <Check size={12} color={c === '#fff' || c === '#c9a84c' || c === '#e8c97a' || c === '#f5ede6' ? '#333' : 'white'} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>وصف التصميم</label>
                <textarea rows={4} placeholder="صفّي تصميمكِ بالتفصيل: الأكمام، القصة، التطريز، التفاصيل..." value={form.description}
                  onChange={e => update('description', e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '2px solid rgba(201,168,76,0.2)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)', direction: 'rtl', outline: 'none', resize: 'vertical' }} />
              </div>

              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>رفع صورة مرجعية (اختياري)</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files?.[0])} style={{ display: 'none' }} />
                <div 
                  className="design-upload"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {form.imagePreview ? (
                    <div style={{ textAlign: 'center' }}>
                      <img src={form.imagePreview} alt="المعاينة" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 12 }} />
                      <p style={{ marginBottom: 8 }}>تغيير الصورة</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, image: null, imagePreview: null })); }} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>حذف الصورة</button>
                    </div>
                  ) : (
                    <>
                      <Upload size={uploading ? 0 : 28} />
                      <p>{uploading ? 'جاري التحميل...' : 'اسحبي صورة أو اضغطي للاختيار'}</p>
                      <span>JPG, PNG - حجم أقصى 5MB</span>
                    </>
                  )}
                </div>
              </div>


              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>نمط التصميم</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <label className={`payment-method ${form.tarzOption === 'no' ? 'active' : ''}`} style={{ marginBottom: 0 }}>
                    <input type="radio" name="tarzOption" value="no" checked={form.tarzOption === 'no'}
                      onChange={() => setForm(p => ({ ...p, tarzOption: 'no', tarzImage: null, tarzImagePreview: null }))} />
                    <span>بدون طرز</span>
                  </label>
                  <label className={`payment-method ${form.tarzOption === 'with' ? 'active' : ''}`} style={{ marginBottom: 0 }}>
                    <input type="radio" name="tarzOption" value="with" checked={form.tarzOption === 'with'}
                      onChange={() => setForm(p => ({ ...p, tarzOption: 'with' }))} />
                    <span>بالطرز</span>
                  </label>
                </div>
              </div>

              {form.tarzOption === 'with' && (
                <div className="form-field" style={{ marginBottom: 20 }}>
                  <label>رفع صورة الطرز</label>
                  <input ref={tarzFileInputRef} type="file" accept="image/*" onChange={(e) => handleTarzImageSelect(e.target.files?.[0])} style={{ display: 'none' }} />
                  <div
                    className="design-upload"
                    onClick={() => tarzFileInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    {form.tarzImagePreview ? (
                      <div style={{ textAlign: 'center' }}>
                        <img src={form.tarzImagePreview} alt="طرز" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 12 }} />
                        <p style={{ marginBottom: 8 }}>تغيير صورة الطرز</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, tarzImage: null, tarzImagePreview: null })); }} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>حذف الصورة</button>
                      </div>
                    ) : (
                      <>
                        <Upload size={uploading ? 0 : 28} />
                        <p>{uploading ? 'جاري التحميل...' : 'اسحبي صورة الطرز أو اضغطي للاختيار'}</p>
                        <span>JPG, PNG - حجم أقصى 5MB</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>ملاحظات إضافية</label>
                <textarea rows={3} placeholder="أي تفاصيل أخرى تودّين إضافتها..." value={form.notes}
                  onChange={e => update('notes', e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '2px solid rgba(201,168,76,0.2)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)', direction: 'rtl', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="form-card">
              <h3>معاينة الطلب</h3>
              <div className="preview-grid">
                <div className="preview-section">
                  <h4>معلومات التواصل</h4>
                  <div className="preview-row"><span>الاسم:</span><span>{form.name || '-'}</span></div>
                  <div className="preview-row"><span>الهاتف:</span><span>{form.phone || '-'}</span></div>
                  <div className="preview-row"><span>الولاية:</span><span>{form.wilaya || '-'}</span></div>
                  {!isDetailsMode && (
                    <>
                      <div className="preview-row"><span>NIF:</span><span>{form.nif || '-'}</span></div>
                      <div className="preview-row"><span>NIS:</span><span>{form.nis || '-'}</span></div>
                    </>
                  )}
                </div>
                <div className="preview-section">
                  <h4>تفاصيل اللباس</h4>
                  <div className="preview-row"><span>النوع:</span><span>{form.clothingType || '-'}</span></div>
                  <div className="preview-row"><span>القماش:</span><span>{form.fabric || '-'}</span></div>
                  <div className="preview-row"><span>الكمية:</span><span>{form.quantity}</span></div>
                  <div className="preview-row"><span>الصدر:</span><span>{form.chest || '-'} سم</span></div>
                  <div className="preview-row"><span>الخصر:</span><span>{form.waist || '-'} سم</span></div>
                </div>
                <div className="preview-section">
                  <h4>الطرز</h4>
                  <div className="preview-row"><span>نوع الطلب:</span><span>{form.tarzOption === 'with' ? 'بالطرز' : 'بدون طرز'}</span></div>
                  {form.tarzImagePreview && (
                    <div style={{ marginTop: 12 }}>
                      <h4 style={{ marginBottom: 8 }}>صورة الطرز</h4>
                      <img src={form.tarzImagePreview} alt="Tarz Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                    </div>
                  )}
                </div>
                <div className="preview-section">
                  <h4>الألوان المختارة</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {form.colors.length > 0
                      ? form.colors.map((c, i) => <span key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />)
                      : <span style={{ color: 'var(--gray-text)', fontSize: 13 }}>لم تحدد ألواناً</span>
                    }
                  </div>
                </div>
                <div className="preview-section preview-section--full">
                  <h4>وصف التصميم</h4>
                  <p style={{ fontSize: 14, color: 'var(--gray-text)', lineHeight: 1.7, marginTop: 8 }}>{form.description || 'لم يُضف وصف'}</p>
                </div>
                {form.imagePreview && (
                  <div className="preview-section preview-section--full">
                    <h4>الصورة المرجعية</h4>
                    <img src={form.imagePreview} alt="الصورة المرجعية" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
                  </div>
                )}
                {!isDetailsMode && form.logoPreview && (
                  <div className="preview-section preview-section--full">
                    <h4>شعار العميل</h4>
                    <img src={form.logoPreview} alt="شعار العميل" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="design-nav">
            {step > 0 && (
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>السابق</button>
            )}
            {step < 3 ? (
              <button className="btn-primary" onClick={() => canProceed() && setStep(s => s + 1)} disabled={!canProceed()} style={{ marginRight: 'auto', opacity: canProceed() ? 1 : 0.5, cursor: canProceed() ? 'pointer' : 'not-allowed' }}>التالي</button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit} style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                إرسال الطلب
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

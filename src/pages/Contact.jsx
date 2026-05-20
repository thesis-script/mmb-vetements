import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import './StaticPages.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="static-page" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        <div className="static-page__hero">
          <MessageCircle size={48} className="static-page__hero-icon" />
          <h1 className="section-title">اتصل بنا</h1>
          <p>نحن هنا للإجابة على استفساراتكِ</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3>معلومات التواصل</h3>
            {[
              { icon: <Phone size={20} />, label: 'الهاتف', value: '0555 123 456' },
              { icon: <Mail size={20} />, label: 'البريد الإلكتروني', value: 'contact@mmb-vetements.dz' },
              { icon: <MapPin size={20} />, label: 'العنوان', value: 'الجزائر العاصمة، الجزائر' },
            ].map((item, i) => (
              <div key={i} className="contact-info__item">
                <div className="contact-info__icon">{item.icon}</div>
                <div>
                  <div className="contact-info__label">{item.label}</div>
                  <div className="contact-info__value">{item.value}</div>
                </div>
              </div>
            ))}
            <div className="contact-hours">
              <h4>أوقات العمل</h4>
              <p>السبت – الخميس: 9:00 ص – 6:00 م</p>
              <p>الجمعة: مغلق</p>
            </div>
          </div>

          <div className="contact-form-wrap">
            {sent ? (
              <div className="contact-success">
                <div style={{ fontSize: 40 }}>✓</div>
                <h3>تم إرسال رسالتكِ!</h3>
                <p>سنتواصل معكِ في أقرب وقت ممكن.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h3>أرسلي رسالة</h3>
                <div className="form-grid">
                  {[
                    { key: 'name', label: 'الاسم', type: 'text', placeholder: 'اسمكِ الكامل' },
                    { key: 'phone', label: 'الهاتف', type: 'tel', placeholder: '05XX XXX XXX' },
                    { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'example@email.com' },
                  ].map(f => (
                    <div key={f.key} className="form-field">
                      <label>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
                    </div>
                  ))}
                </div>
                <div className="form-field form-field--full">
                  <label>الرسالة</label>
                  <textarea rows={5} placeholder="كيف يمكننا مساعدتكِ؟" value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid rgba(201,168,76,0.2)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)', direction: 'rtl', outline: 'none', resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Send size={16} /> إرسال الرسالة
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Truck, Clock, MapPin, Package } from 'lucide-react';
import './StaticPages.css';
import { wilayas } from '../data/staticData';

export default function Shipping() {
  const shippingConfig = useMemo(() => {
    try {
      const raw = localStorage.getItem('mmb_shipping_config');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }, []);

  return (
    <div className="static-page" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        <div className="static-page__hero">
          <Truck size={48} className="static-page__hero-icon" />
          <h1 className="section-title">الشحن والتوصيل</h1>
          <p>نوصل طلباتكِ إلى جميع ولايات الجزائر</p>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-card__icon"><Clock size={24} /></div>
            <h3>مدة التوصيل</h3>
            <p>تختلف حسب الولاية؛ يتم عرض التكلفة عند اختيار الولاية أثناء الدفع</p>
          </div>
          <div className="info-card">
            <div className="info-card__icon"><MapPin size={24} /></div>
            <h3>التغطية الجغرافية</h3>
            <p>جميع ولايات الجزائر بدون استثناء</p>
          </div>
          <div className="info-card">
            <div className="info-card__icon"><Package size={24} /></div>
            <h3>تغليف آمن</h3>
            <p>نضمن وصول طلبكِ سليماً بتغليف محكم</p>
          </div>
        </div>

        <div className="static-content">
          <h2>تفاصيل الشحن حسب الولاية</h2>
          <table className="shipping-table">
            <thead>
              <tr>
                <th>رقم</th>
                <th>الولاية</th>
                <th>تكلفة الشحن</th>
              </tr>
            </thead>
            <tbody>
              {wilayas.map((w, i) => (
                <tr key={w}>
                  <td>{i + 1}</td>
                  <td>{w}</td>
                  <td>
                    {shippingConfig[w] !== undefined && shippingConfig[w] !== ''
                      ? <strong style={{ color: 'var(--gold-dark)' }}>{String(shippingConfig[w]).toLocaleString()} دج</strong>
                      : <span style={{ color: 'var(--gray-text)' }}>لم يتم التحديد</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="info-note">
            <strong>ملاحظة:</strong> يتم احتساب تكلفة الشحن حسب الولاية عند إتمام الطلب.
          </div>
        </div>
      </div>
    </div>
  );
}

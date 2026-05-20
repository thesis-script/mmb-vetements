import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-main">MMB</span>
              <span className="footer__logo-sub">VÊTEMENTS</span>
            </div>
            <p className="footer__tagline">متخصص في الألبسة النسائية<br/>الراقية والمصممة خصيصاً لكِ</p>
            <div className="footer__social">
              <a href="#" className="footer__social-btn"><Instagram size={18}/></a>
              <a href="#" className="footer__social-btn"><Facebook size={18}/></a>
            </div>
          </div>

          <div className="footer__col">
            <h4>روابط سريعة</h4>
            <Link to="/">الرئيسية</Link>
            <Link to="/products">المنتجات الجاهزة</Link>
            <Link to="/custom-design">تصميم حسب الطلب</Link>
            <Link to="/shipping">الشحن والتوصيل</Link>
            <Link to="/faq">الأسئلة الشائعة</Link>
          </div>

          <div className="footer__col">
            <h4>تواصل معنا</h4>
            <div className="footer__contact-item"><Phone size={14}/> <span>0555 123 456</span></div>
            <div className="footer__contact-item"><Mail size={14}/> <span>contact@mmb-vetements.dz</span></div>
            <div className="footer__contact-item"><MapPin size={14}/> <span>الجزائر العاصمة، الجزائر</span></div>
          </div>

          <div className="footer__col">
            <h4>أوقات العمل</h4>
            <p>السبت - الخميس</p>
            <p>9:00 ص - 6:00 م</p>
            <div className="footer__badge">🚚 توصيل لجميع الولايات</div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© 2026 MMB Vêtements. جميع الحقوق محفوظة.</p>
          <p>صُنع بـ ♥ في الجزائر</p>
        </div>
      </div>
    </footer>
  );
}

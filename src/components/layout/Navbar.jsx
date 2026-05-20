import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'الرئيسية' },
  { path: '/products', label: 'المنتجات الجاهزة' },
  { path: '/custom-design', label: 'تصميم حسب الطلب' },
  { path: '/shipping', label: 'الشحن والتوصيل' },
  { path: '/faq', label: 'الأسئلة الشائعة' },
  { path: '/contact', label: 'اتصل بنا' },
];

export default function Navbar() {
  const { count } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon" style={{width:'50px', height:'50px'}}>
            <img src="logo.png" alt="Logo"  style={{width:'50px', height:'50px'}} />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <Link to="/admin" className="navbar__action-btn" title="لوحة الإدارة">
            <User size={20} />
          </Link>
          <Link to="/cart" className="navbar__cart-btn">
            <ShoppingCart size={20} />
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </Link>
          <button className="navbar__menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__mobile-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/cart" className="navbar__mobile-cart">
            <ShoppingCart size={18} />
            سلة الطلبات {count > 0 && `(${count})`}
          </Link>
        </div>
      )}
    </header>
  );
}

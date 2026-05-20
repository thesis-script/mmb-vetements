import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Truck, Shield, Scissors, Sparkles } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { products, categories } from '../data/staticData';
import './Home.css';

const featuredProducts = products.filter(p => p.isBestseller).slice(0, 4);
const newProducts = products.filter(p => p.isNew).slice(0, 4);

export default function Home() {
  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__noise" />
        <div className="hero__orb hero__orb--a" />
        <div className="hero__orb hero__orb--b" />

        <div className="container hero__inner">
          {/* LEFT */}
          <div className="hero__content">
            <span className="hero__eyebrow">
              <span className="hero__eyebrow-dot" />
              كوليكشن 2026
            </span>

            <h1 className="hero__title">
              <span className="hero__title-line">MMB</span>
              <span className="hero__title-line hero__title-line--sub">Vêtements</span>
              <span className="hero__title-accent">بالجملة فقط</span>
            </h1>

            <p className="hero__desc">
              ألبسة نسائية راقية جاهزة للبيع، بيع بالجملة وتصاميم جزائرية أصيلة حسب الطلب.
              نحن هنا لنُجسّد أحلامك.
            </p>

            <div className="hero__btns">
              <Link to="/products" className="btn-hero-primary">
                <span>منتجاتنا المتوفرة للبيع بالجملة</span>
                <span className="btn-hero-primary__arrow">←</span>
              </Link>
              <Link to="/custom-design" className="btn-hero-secondary">
                <Scissors size={15} />
                <span>اطلب تصاميمك الخاصة</span>
              </Link>
            </div>

            <div className="hero__stats">
              {[
                { num: '500+', label: 'زبونة سعيدة' },
                { num: '58', label: 'ولاية' },
                { num: '100%', label: 'جودة مضمونة' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="hero__stat-div" />}
                  <div className="hero__stat">
                    <strong>{s.num}</strong>
                    <span>{s.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hero__visual">
            <div className="hero__frame">
              <div className="hero__frame-tag">
                <Star size={11} fill="currentColor" />
                <span>4.9 — تقييم ممتاز</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=600&q=80"
                alt="ألبسة MMB"
                className="hero__img"
              />
              <div className="hero__frame-label">
                <span>New Season 2026</span>
              </div>
            </div>
            {/* floating accent card */}
            <div className="hero__accent-card">
              <Sparkles size={14} />
              <span>وصل حديثاً</span>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        {/* <div className="hero__marquee-wrap">
          <div className="hero__marquee">
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="hero__marquee-item">
                ✦ جملة &nbsp; ✦ تصميم خاص &nbsp; ✦ 58 ولاية &nbsp; ✦ جودة راقية &nbsp;
              </span>
            ))}
          </div>
        </div> */}
      </section>

      {/* ── FEATURES ── */}
      <section className="features container">
        {[
          { icon: <Truck size={20} />, title: 'توصيل لكل الجزائر', desc: 'شحن سريع لجميع الولايات الـ 58' },
          { icon: <Shield size={20} />, title: 'جودة مضمونة 100%', desc: 'خامات فاخرة مختارة بعناية' },
          { icon: <Scissors size={20} />, title: 'تصميم حسب الطلب', desc: 'تصاميم حصرية بمقاساتكِ الخاصة' },
          { icon: <Sparkles size={20} />, title: 'أحدث الموضة', desc: 'كوليكشنات موسمية متجددة دائماً' },
        ].map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-card__icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── CATEGORIES ── */}
      <section className="home-section container">
        <div className="home-section__header">
          <div style={{padding:'30px 0'}}>
            <p className="section-eyebrow">تصنيفاتنا</p>
            <h2 className="section-title">اختاري القسم</h2>
          </div>
        </div>
        <div className="categories-grid">
          {categories.slice(1).map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-chip">
              <span className="category-chip__icon">{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="home-section container">
        <div className="home-section__header">
          <div style={{padding:'30px 0'}}>
            <p className="section-eyebrow">الأكثر طلباً</p>
            <h2 className="section-title">ما يُفضّله عملاؤنا</h2>
          </div>
          <Link to="/products" className="home-section__link">
            عرض الكل <ArrowLeft size={15} />
          </Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner"  style={{padding:'30px 0'}}>
        <div className="cta-banner__bg-text" aria-hidden>DESIGN</div>
        <div className="container cta-banner__inner">
          <p className="cta-banner__eyebrow">تصميم خاص بكِ</p>
          <h2>هل لديكِ تصميم في ذهنكِ؟</h2>
          <p>أرسلي لنا تفاصيل تصميمكِ الخاص وسنُحوّله إلى واقع ملموس بمقاساتكِ ورؤيتكِ الفريدة.</p>
          <Link to="/custom-design" className="btn-cta">
            <Scissors size={16} />
            <span>اطلب تصاميمك الخاصة</span>
          </Link>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="home-section container">
        <div className="home-section__header">
          <div style={{padding:'30px 0'}}>
            <p className="section-eyebrow">وصل حديثاً</p>
            <h2 className="section-title">آخر الإضافات</h2>
          </div>
          <Link to="/products?filter=new" className="home-section__link">
            عرض الكل <ArrowLeft size={15} />
          </Link>
        </div>
        <div className="products-grid">
          {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

    </div>
  );
}
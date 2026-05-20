/**
 * App.js — Root component.
 *
 * Changes from original:
 *  - CacheProvider replaced with StoreProvider (new architecture)
 *  - CartProvider stays — it's a separate concern (ephemeral session data)
 *  - No other changes to routing or layout
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CustomDesign from './pages/CustomDesign';
import Shipping from './pages/Shipping';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import './styles/globals.css';

function Layout({ children, hideFooter }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        {/* StoreProvider replaces CacheProvider — same tree position */}
        <StoreProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/cart" element={<Layout><Cart /></Layout>} />
            <Route path="/custom-design" element={<Layout><CustomDesign /></Layout>} />
            <Route path="/shipping" element={<Layout><Shipping /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/admin" element={<Layout hideFooter><Admin /></Layout>} />
          </Routes>
        </StoreProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

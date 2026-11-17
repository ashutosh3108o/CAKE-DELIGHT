import LoginPage from './LoginPage';
import LandingPage from './LandingPage';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, ShoppingBag, Bell, UserRound, CakeSlice, Heart, Star,
  Plus, Minus, Trash2, X, Menu, ArrowRight, CheckCircle2,
  Clock3, PackageCheck, SlidersHorizontal, ChevronDown,
  RefreshCw, Sparkles
} from 'lucide-react';
import './styles.css';

const DEFAULT_API = 'http://localhost:8084';

const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);


const cakeImages = {
  "geodecake": "/images/cakes/geode-cake.jpg",
  "fruitcake": "/images/cakes/fruit-cake.jpg",
  "coffeecake": "/images/cakes/Coffee-cake.jpg",
  "coconutcake": "/images/cakes/coconut-cake.jpg",
  "chocolavacake": "/images/cakes/chocolava-cake.jpg",
  "chocolatecake": "/images/cakes/chocolate-cake.jpg",
  "cheesecake": "/images/cakes/Cheesecake.jpg",
  "charlottecake": "/images/cakes/Charlotte-Cake.jpg",
  "carrotcake": "/images/cakes/carrot-cake.jpg",
  "bundtcake": "/images/cakes/bundt-cake.jpg",
  "browniecake": "/images/cakes/brownie-cake.jpg",
  "blackforestcake": "/images/cakes/black-forest-cake.jpg",
  "battenbergcake": "/images/cakes/Battenberg-Cake.jpg",
  "bananacake": "/images/cakes/banana-cake.jpg",
  "applecake": "/images/cakes/Apple-cake.jpg",
  "angelfoodcake": "/images/cakes/angel-food-cake.jpg"
};

const normalizeCakeName = (value = "") =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/\.jpg$/, "");

const cakeAliases = {
  chocolatetruffle: "chocolavacake",
  vanilla: "angelfoodcake"
};

const imageFor = (cake, i = 0) => {
  const name = normalizeCakeName(cake?.name);
  const reference = normalizeCakeName(cake?.imageReference);

  const key = cakeAliases[name] || name;
  const referenceKey = cakeAliases[reference] || reference;

  return (
    cakeImages[key] ||
    cakeImages[referenceKey] ||
    "/images/cakes/chocolate-cake.jpg"
  );
};


function App() {
  const [api, setApi] = useState(
    localStorage.getItem('cd_api') || DEFAULT_API
  );

  const [customer, setCustomer] = useState(
    localStorage.getItem('cd_customer') || 'Cake Delight Customer'
  );

  const [cakes, setCakes] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [basket, setBasket] = useState([]);

  const [activeOrder, setActiveOrder] = useState(
    localStorage.getItem('cd_order') || ''
  );

  const [page, setPage] = useState('home');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(5000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [showAccount, setShowAccount] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState('');

  const headers = { 'Content-Type': 'application/json' };

  const request = async (path, options = {}) => {
    const res = await fetch(
      `${api.replace(/\/$/, '')}${path}`,
      {
        ...options,
        headers: { ...headers, ...options.headers }
      }
    );

    if (!res.ok) {
      let msg = 'Request failed';
      try {
        msg = await res.text() || msg;
      } catch {}
      throw new Error(`${res.status}: ${msg}`);
    }

    if (res.status === 204) return null;

    const t = await res.text();

    try {
      return t ? JSON.parse(t) : null;
    } catch {
      return t;
    }
  };

  const notify = s => {
    setToast(s);
    setTimeout(() => setToast(''), 3000);
  };

  const loadCatalog = async () => {
    try {
      const data = await request('/cakes');
      setCakes(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(
        `Cannot load cakes. Check that the API Gateway is running at ${api}. ${e.message}`
      );
    }
  };

  const loadRatings = async () => {
    try {
      const data = await request('/ratings');
      setRatings(Array.isArray(data) ? data : []);
    } catch {
      setRatings([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await request('/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await request('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(`Could not load orders: ${e.message}`);
    }
  };

  const loadBasket = async (id = activeOrder) => {
    if (!id) {
      setBasket([]);
      return;
    }

    try {
      const data = await request(`/orders/basket/${id}`);
      setBasket(Array.isArray(data) ? data : []);
    } catch (e) {
      setBasket([]);
      setError(`Could not load basket: ${e.message}`);
    }
  };

  const refresh = async () => {
    setLoading(true);

    await Promise.all([
      loadCatalog(),
      loadRatings(),
      loadNotifications(),
      loadOrders()
    ]);

    await loadBasket();
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    localStorage.setItem('cd_api', api);
  }, [api]);

  useEffect(() => {
    localStorage.setItem('cd_customer', customer);
  }, [customer]);

  useEffect(() => {
    loadOrders();
    if (activeOrder) loadBasket(activeOrder);
  }, []);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('cd_order', activeOrder);
    } else {
      localStorage.removeItem('cd_order');
    }
  }, [activeOrder]);

  const categories = useMemo(
    () => ['All', ...new Set(cakes.map(c => c.category).filter(Boolean))],
    [cakes]
  );

  const filtered = cakes.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || c.category === category) &&
    Number(c.price || 0) <= maxPrice &&
    c.available !== false
  );

  const cartCount = basket.reduce(
    (s, i) => s + Number(i.quantity || 0),
    0
  );

  const cartTotal = basket.reduce((s, i) => {
    const c = cakes.find(
      x => Number(x.id) === Number(i.cakeId)
    );

    return s + (Number(c?.price) || 0) * Number(i.quantity || 0);
  }, 0);

  const avgFor = id => {
    const list = ratings.filter(
      r => Number(r.cakeId) === Number(id)
    );

    return list.length
      ? (
          list.reduce((s, r) => s + Number(r.rating || 0), 0) /
          list.length
        ).toFixed(1)
      : null;
  };

  const ensureOrder = async cake => {
    let id = activeOrder;

    if (!id) {
      const order = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: customer,
          cakeId: cake.id,
          quantity: 1,
          totalPrice: Number(cake.price) || 0
        })
      });

      id = String(order.id);
      setActiveOrder(id);
    }

    return id;
  };

  const addToCart = async cake => {
    try {
      const id = await ensureOrder(cake);

      await request('/orders/basket', {
        method: 'POST',
        body: JSON.stringify({
          orderId: Number(id),
          cakeId: Number(cake.id),
          quantity: 1
        })
      });

      await loadBasket(id);
      notify(`${cake.name} added to your basket`);
    } catch (e) {
      notify(e.message);
    }
  };

  const changeQty = async (item, delta) => {
    const qty = Number(item.quantity) + delta;

    if (qty < 1) return removeItem(item);

    try {
      await request(`/orders/basket/item/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...item,
          quantity: qty
        })
      });

      await loadBasket();
    } catch (e) {
      notify(e.message);
    }
  };

  const removeItem = async item => {
    try {
      await request(`/orders/basket/item/${item.id}`, {
        method: 'DELETE'
      });

      await loadBasket();
      notify('Item removed from basket');
    } catch (e) {
      notify(e.message);
    }
  };

  const checkout = async () => {
    if (!basket.length) return;

    try {
      const order = await request(
        `/orders/checkout/${activeOrder}`,
        { method: 'POST' }
      );

      notify(`Order #${order.id} placed successfully!`);

      setBasket([]);
      setActiveOrder('');
      setShowCart(false);

      await Promise.all([
        loadOrders(),
        loadNotifications()
      ]);

      setPage('orders');
    } catch (e) {
      notify(`Checkout failed: ${e.message}`);
    }
  };

  const submitRating = async () => {
    try {
      await request('/ratings', {
        method: 'POST',
        body: JSON.stringify({
          orderId: Number(ratingTarget.orderId),
          cakeId: Number(ratingTarget.cakeId),
          customerName: customer,
          rating: ratingValue,
          review
        })
      });

      notify('Thank you for your rating!');

      setRatingTarget(null);
      setReview('');

      await loadRatings();
    } catch (e) {
      notify(`Rating failed: ${e.message}`);
    }
  };

  const getCake = id =>
    cakes.find(c => Number(c.id) === Number(id));

  const nav = p => {
    setPage(p);
    setShowMobile(false);

    if (p === 'orders') loadOrders();
    if (p === 'notifications') loadNotifications();
  };

  return (
    <div className="app-shell">

      <header className="topbar">
        <div className="top-inner">

          <button
            className="mobile-menu icon-btn"
            onClick={() => setShowMobile(!showMobile)}
          >
            <Menu />
          </button>

          <button
            className="brand"
            onClick={() => nav('home')}
          >
            <span className="brand-mark">
              <CakeSlice size={23} />
            </span>

            <span>
              Cake<span className="brand-accent">Delight</span>
              <small>BAKED WITH LOVE</small>
            </span>
          </button>

          <nav className={showMobile ? 'nav-links open' : 'nav-links'}>
            <button
              className={page === 'home' ? 'active' : ''}
              onClick={() => nav('home')}
            >
              Home
            </button>

            <button
              className={page === 'menu' ? 'active' : ''}
              onClick={() => nav('menu')}
            >
              Our Cakes
            </button>

            <button
              className={page === 'orders' ? 'active' : ''}
              onClick={() => nav('orders')}
            >
              My Orders
            </button>

            <button
              className={page === 'notifications' ? 'active' : ''}
              onClick={() => nav('notifications')}
            >
              Notifications
            </button>
          </nav>

          <div className="header-actions">

            <button
              className="icon-btn notification-btn"
              title="Notifications"
              onClick={() => nav('notifications')}
            >
              <Bell size={20} />
              {notifications.length > 0 && <i />}
            </button>

            <button
              className="icon-btn account-btn"
              title="Account settings"
              onClick={() => setShowAccount(true)}
            >
              <UserRound size={20} />
            </button>

            <button
              className="cart-btn"
              onClick={() => setShowCart(true)}
            >
              <ShoppingBag size={19} />
              <span>Basket</span>
              <b>{cartCount}</b>
            </button>

          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {page === 'home' && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <Sparkles size={15} />
                MADE FRESH, JUST FOR YOU
              </div>

              <h1>
                Every bite is a little piece of <em>heaven.</em>
              </h1>

              <p>
                Discover handcrafted cakes made with love,
                the finest ingredients and a little magic.
              </p>

              <button
                className="primary-btn"
                onClick={() => nav('menu')}
              >
                Explore Our Cakes <ArrowRight size={17} />
              </button>

              <div className="hero-stats">
                <div><b>100%</b><small>Freshly baked</small></div>
                <div><b>50+</b><small>Unique flavours</small></div>
                <div><b>4.9/5</b><small>Happy customers</small></div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-wrap">
                <img
                  src="/images/cakes/chocolate-cake.jpg"
                  alt="Delicious chocolate cake"
                />
              </div>

              <div className="floating-note">
                <Heart size={17} />
                <span>Made with love</span>
              </div>
            </div>
          </section>

          <section className="benefits">
            <div>
              <span className="benefit-icon"><CakeSlice /></span>
              <span><b>Freshly Baked</b><small>Every single day</small></span>
            </div>

            <div>
              <span className="benefit-icon"><PackageCheck /></span>
              <span><b>Quality Ingredients</b><small>Only the finest</small></span>
            </div>

            <div>
              <span className="benefit-icon"><Heart /></span>
              <span><b>Made with Love</b><small>In every bite</small></span>
            </div>

            <div>
              <span className="benefit-icon"><CheckCircle2 /></span>
              <span><b>Easy Ordering</b><small>Simple and secure</small></span>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">OUR COLLECTION</span>
                <h2>Customer favourites</h2>
              </div>

              <button
                className="text-link"
                onClick={() => nav('menu')}
              >
                View all cakes <ArrowRight size={15} />
              </button>
            </div>

            <CakeGrid
              cakes={cakes.slice(0, 4)}
              ratings={ratings}
              addToCart={addToCart}
              avgFor={avgFor}
            />
          </section>
        </>
      )}

      {page === 'menu' && (
        <section className="section menu-section">
          <div className="page-intro">
            <span className="eyebrow">BAKED TO PERFECTION</span>
            <h1>Our Cakes</h1>
            <p>Find your perfect slice of happiness.</p>
          </div>

          <div className="filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cakes..."
              />
            </div>

            <select
              className="category-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <div className="price-filter">
              <label>Max price: {money(maxPrice)}</label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              />
            </div>

            <button
              className="icon-btn"
              title="Refresh catalog"
              onClick={loadCatalog}
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <CakeGrid
            cakes={filtered}
            ratings={ratings}
            addToCart={addToCart}
            avgFor={avgFor}
          />

          {filtered.length === 0 && (
            <div className="empty-state">
              <CakeSlice size={40} />
              <h3>No cakes found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          )}
        </section>
      )}

      {page === 'orders' && (
        <section className="section">
          <div className="page-intro">
            <span className="eyebrow">YOUR PURCHASES</span>
            <h1>My Orders</h1>
            <p>Track your delicious orders.</p>
          </div>

          <div className="orders-list">
            {orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                text="Your delicious journey starts here."
                action={() => nav('menu')}
              />
            ) : (
              orders.map(order => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-top">
                    <div>
                      <small>ORDER NUMBER</small>
                      <h3>#{order.id}</h3>
                    </div>

                    <span className="status-pill">
                      {order.status || 'PLACED'}
                    </span>
                  </div>

                  <div className="order-details">
                    <span>
                      Customer:
                      <b>{order.customerName || customer}</b>
                    </span>

                    <span>
                      Total:
                      <b>{money(order.totalPrice)}</b>
                    </span>
                  </div>

                  <div className="order-card-bottom">
                    <span>
                      <Clock3 size={14} />
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : 'Order placed'}
                    </span>

                    <button
                      className="outline-btn small"
                      onClick={() => setRatingTarget({
                        orderId: order.id,
                        cakeId: order.cakeId
                      })}
                    >
                      <Star size={14} /> Rate cake
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {page === 'notifications' && (
        <section className="section">
          <div className="page-intro">
            <span className="eyebrow">STAY UPDATED</span>
            <h1>Notifications</h1>
            <p>Your order confirmations and updates.</p>
          </div>

          <div className="notification-toolbar">
            <span>{notifications.length} notifications</span>

            <button
              className="text-link"
              onClick={loadNotifications}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <EmptyState
                title="No notifications"
                text="Your order updates will appear here."
                action={() => nav('menu')}
              />
            ) : (
              notifications.map((n, i) => (
                <div className="notification-card" key={n.id || i}>
                  <div className="notification-icon">
                    <CheckCircle2 size={20} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-head">
                      <b>{n.title || 'Order confirmation'}</b>
                      <span className="status-pill">
                        {n.status || 'SENT'}
                      </span>
                    </div>

                    <p>
                      {n.message || n.content || 'Your order has been confirmed.'}
                    </p>

                    <small>
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : 'Order update'}
                      {' · '}
                      Delivery status: {n.status || 'SENT'}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark"><CakeSlice /></span>
          Cake Delight
        </div>

        <p>Life is short. Eat the cake.</p>

        <div className="footer-bottom">
          <span>© 2026 Cake Delight. All rights reserved.</span>
          <span>Freshly baked with love.</span>
        </div>
      </footer>

      {showCart && (
        <div
          className="overlay"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <small>YOUR SELECTION</small>
                <h2>
                  Your Basket <span>({cartCount} items)</span>
                </h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowCart(false)}
              >
                <X />
              </button>
            </div>

            <div className="basket-items">
              {basket.length === 0 ? (
                <EmptyState
                  title="Your basket is empty"
                  text="Add a delicious cake to get started."
                  action={() => {
                    setShowCart(false);
                    nav('menu');
                  }}
                />
              ) : (
                basket.map(item => {
                  const cake = getCake(item.cakeId);

                  return (
                    <div className="basket-item" key={item.id}>
                      <img
                        src={cake ? imageFor(cake, 0) : fallbackImages[0]}
                        alt={cake?.name || 'Cake'}
                      />

                      <div className="basket-info">
                        <b>{cake?.name || `Cake #${item.cakeId}`}</b>
                        <small>{money(cake?.price)}</small>

                        <div className="qty-control">
                          <button onClick={() => changeQty(item, -1)}>
                            <Minus size={13} />
                          </button>

                          <span>{item.quantity}</span>

                          <button onClick={() => changeQty(item, 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {basket.length > 0 && (
              <div className="basket-summary">
                <div>
                  <span>Subtotal</span>
                  <b>{money(cartTotal)}</b>
                </div>

                <small>Taxes and delivery charges, if applicable, may be additional.</small>

                <button
                  className="primary-btn checkout-btn"
                  onClick={checkout}
                >
                  Proceed to Checkout <ArrowRight size={17} />
                </button>

                <p>
                  <CheckCircle2 size={14} />
                  Secure order processing
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {showAccount && (
        <div
          className="overlay modal-overlay"
          onClick={() => setShowAccount(false)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <small>GUEST CHECKOUT</small>
                <h2>Customer Settings</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowAccount(false)}
              >
                <X />
              </button>
            </div>

            <label className="field-label">
              Customer name
              <input
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                placeholder="Enter your name"
              />
            </label>

            <label className="field-label">
              API Gateway URL
              <input
                value={api}
                onChange={e => setApi(e.target.value)}
                placeholder="http://localhost:8084"
              />
            </label>

            <p className="field-help">
              This application uses guest mode. No login or JWT token is required.
            </p>

            <button
              className="primary-btn full-btn"
              onClick={() => {
                setShowAccount(false);
                notify('Settings saved');
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {ratingTarget && (
        <div
          className="overlay modal-overlay"
          onClick={() => setRatingTarget(null)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <small>SHARE YOUR EXPERIENCE</small>
                <h2>Rate this cake</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setRatingTarget(null)}
              >
                <X />
              </button>
            </div>

            <p className="rating-caption">
              How was your cake?
            </p>

            <div className="star-picker">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  className={value <= ratingValue ? 'selected' : ''}
                  onClick={() => setRatingValue(value)}
                >
                  <Star size={29} fill="currentColor" />
                </button>
              ))}
            </div>

            <label className="field-label">
              Your review
              <textarea
                rows="4"
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Tell us what you loved..."
              />
            </label>

            <button
              className="primary-btn full-btn"
              onClick={submitRating}
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}

    </div>
  );
}

function CakeGrid({ cakes, addToCart, avgFor }) {
  return (
    <div className="cake-grid">
      {cakes.map((cake, i) => (
        <div className="cake-card" key={cake.id}>
          <div className="cake-image">
            <img
              src={imageFor(cake, i)}
              alt={cake.name}
              loading="lazy"
            />

            <span className="cake-category">
              {cake.category || 'Freshly baked'}
            </span>
          </div>

          <div className="cake-info">
            <h3>{cake.name}</h3>

            <p>{cake.description || 'Delicious freshly baked cake.'}</p>

            <div className="cake-rating">
              <Star size={13} fill="currentColor" />
              {avgFor(cake.id) || 'New'}
              <small>Customer rating</small>
            </div>

            <div className="cake-card-bottom">
              <b>{money(cake.price)}</b>

              <button
                className="add-btn"
                onClick={() => addToCart(cake)}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <ShoppingBag size={38} />
      <h3>{title}</h3>
      <p>{text}</p>

      <button className="outline-btn" onClick={action}>
        Explore Cakes <ArrowRight size={14} />
      </button>
    </div>
  );
}

function RootApp() {
  const [screen, setScreen] = useState('landing');

  if (screen === 'landing') {
    return (
      <LandingPage
        onLogin={() => setScreen('login')}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginPage
        onLogin={() => setScreen('app')}
        onBack={() => setScreen('landing')}
      />
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

// function RootApp() {
//   const [showApp, setShowApp] = useState(false);

//   return showApp ? (
//     <App />
//   ) : (
//     <LandingPage onLogin={() => setShowApp(true)} />
//   );
// }

// createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <RootApp />
//   </React.StrictMode>
// );

// createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

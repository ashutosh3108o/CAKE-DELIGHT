import React from 'react';
import { CakeSlice, ArrowRight, Heart, Star } from 'lucide-react';
import './landing.css';

function LandingPage({ onLogin }) {
  return (
    <div className="landing-page">

      <header className="landing-header">
        <div className="landing-brand">
          <CakeSlice size={30} />
          <span>Cake <b>Delight</b></span>
        </div>

        <button className="landing-login" onClick={onLogin}>
          Login <ArrowRight size={17} />
        </button>
      </header>

      <main className="landing-hero">
        <div className="landing-content">

          <span className="landing-tag">
            <Heart size={15} /> MADE WITH LOVE
          </span>

          <h1>
            A Little Slice of
            <span> Happiness.</span>
          </h1>

          <p>
            Discover delicious handcrafted cakes, made fresh
            with love and the finest ingredients.
            Every celebration deserves something special.
          </p>

          <button className="landing-explore" onClick={onLogin}>
            Explore Cake Delight
            <ArrowRight size={19} />
          </button>

          <div className="landing-rating">
            <Star size={17} fill="currentColor" />
            <span>Freshly baked, specially made for you.</span>
          </div>

        </div>

        <div className="landing-image">
          <img
            src="/images/cakes/black-forest-cake.jpg"
            alt="Black Forest Cake"
          />
          <div className="landing-image-label">
            <CakeSlice size={20} />
            Freshness in Every Bite
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        © 2026 Cake Delight. Made with love.
      </footer>

    </div>
  );
}

export default LandingPage;

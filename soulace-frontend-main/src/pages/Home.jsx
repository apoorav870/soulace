import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              A Safe Space for Mental Health
              <span className="highlight"> Without Fear or Stigma</span>
            </h1>
            <p className="hero-subtitle">
              Break free from judgment. Get the support you need through AI-powered conversations, 
              anonymous communities, and verified mental health professionals.
            </p>
            <div className="hero-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section problem-section">
        <div className="container">
          <h2 className="section-title">The Problem We're Solving</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">😰</div>
              <h3>Fear of Judgment</h3>
              <p>People fear being labeled as 'crazy' if they visit mental health professionals, preventing them from seeking the help they need.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🚫</div>
              <h3>Social Stigma</h3>
              <p>Deep-rooted social stigma creates barriers that stop many from reaching out for support, even when they desperately need it.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">⏰</div>
              <h3>Long-term Consequences</h3>
              <p>Ignoring mental health concerns leads to bigger problems down the road, affecting relationships, careers, and overall well-being.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="section solution-section">
        <div className="container">
          <h2 className="section-title">Our Comprehensive Solution</h2>
          <p className="section-subtitle">
            We've built a platform that combines multiple approaches to mental health support
          </p>
          <div className="solution-grid">
            <div className="solution-card">
              <div className="solution-icon">🤖</div>
              <h3>AI Chatbot</h3>
              <p>Have safe, private conversations with our AI assistant. Get instant, generic solutions and guidance 24/7, completely anonymously.</p>
              <Link to="/chatbot" className="solution-link">
                Try AI Chat →
              </Link>
            </div>
            <div className="solution-card">
              <div className="solution-icon">💬</div>
              <h3>Anonymous Chat Rooms</h3>
              <p>Connect with others worldwide who understand what you're going through. Your identity stays completely hidden while you share and receive support.</p>
              <Link to="/chatrooms" className="solution-link">
                Join Chat Rooms →
              </Link>
            </div>
            <div className="solution-card">
              <div className="solution-icon">👨‍⚕️</div>
              <h3>Verified Doctors</h3>
              <p>Book appointments with verified mental health professionals. Consult, get personalized care, and rate your experience to help others.</p>
              <Link to="/doctors" className="solution-link">
                Find Doctors →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title">Additional Features</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <h3>📚 E-Store</h3>
              <p>Access curated audiobooks and books recommended by mental health professionals to support your journey.</p>
            </div>
            <div className="feature-card card">
              <h3>📊 Health Reports</h3>
              <p>Subscription-based mental health reports powered by smartwatch and phone data to track your well-being.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="section audience-section">
        <div className="container">
          <h2 className="section-title">Who We Serve</h2>
          <div className="audience-grid">
            <div className="audience-item">
              <h3>🎓 Students</h3>
              <p>Dealing with exam stress, career anxiety, and the pressures of academic life.</p>
            </div>
            <div className="audience-item">
              <h3>💼 Working Professionals</h3>
              <p>Managing workplace stress, burnout, and the challenges of modern careers.</p>
            </div>
            <div className="audience-item">
              <h3>👨‍👩‍👧 Homemakers</h3>
              <p>Facing loneliness, family pressures, and the need for emotional support.</p>
            </div>
            <div className="audience-item">
              <h3>🌍 Everyone</h3>
              <p>Anyone struggling with mental health challenges deserves a safe space to heal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">
              Together, let's make mental health conversations fearless.
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-large">
                Create Your Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Soulace</h3>
              <p>A safe space for mental health without fear or stigma</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <Link to="/doctors">Find Doctors</Link>
                <Link to="/chatbot">AI Chat</Link>
                <Link to="/chatrooms">Chat Rooms</Link>
                <Link to="/store">Store</Link>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Soulace. Founded by Apoorav Kashyap.</p>
            <p>Contact: <a href="mailto:apooravkashyap8@gmail.com">apooravkashyap8@gmail.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home


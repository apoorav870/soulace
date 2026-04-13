import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const captchaContainerRef = useRef(null)
  const captchaWidgetIdRef = useRef(null)
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
  const captchaEnabled = Boolean(turnstileSiteKey)

  useEffect(() => {
    if (!captchaEnabled) return

    const renderCaptcha = () => {
      if (!window.turnstile || !captchaContainerRef.current || captchaWidgetIdRef.current !== null) return

      captchaWidgetIdRef.current = window.turnstile.render(captchaContainerRef.current, {
        sitekey: turnstileSiteKey,
        theme: 'dark',
        callback: (token) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken('')
      })
    }

    if (window.turnstile) {
      renderCaptcha()
      return
    }

    const existing = document.querySelector('script[data-turnstile="true"]')
    if (existing) {
      existing.addEventListener('load', renderCaptcha, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstile = 'true'
    script.onload = renderCaptcha
    document.head.appendChild(script)
  }, [captchaEnabled, turnstileSiteKey])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (captchaEnabled && !captchaToken) {
      setError('Please complete CAPTCHA verification')
      setLoading(false)
      return
    }

    const result = await login(
      formData.email,
      formData.password,
      captchaEnabled ? captchaToken : undefined
    )
    
    if (result.success) {
      // Redirect based on user role
      const userRole = result.user?.role
      if (userRole === 'doctor') {
        navigate('/doctor/dashboard')
      } else if (userRole === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard') // patient or default
      }
    } else {
      setError(result.message)
      if (captchaEnabled && window.turnstile && captchaWidgetIdRef.current !== null) {
        window.turnstile.reset(captchaWidgetIdRef.current)
        setCaptchaToken('')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your mental health journey</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {captchaEnabled && (
              <div className="input-group">
                <label>Verification</label>
                <div ref={captchaContainerRef}></div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

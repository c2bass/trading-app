import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAuth() {
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email to confirm signup!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Trading Journal</h1>
        <p className="subtitle">Track your trades, improve your skills</p>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button 
          onClick={handleAuth}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Sign In'}
        </button>

        <p className="toggle-auth">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            onClick={() => setIsSignup(!isSignup)}
            type="button"
            className="link-btn"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

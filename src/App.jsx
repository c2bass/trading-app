import { useEffect, useState } from 'react'
import { supabase, fetchTrades } from './lib/supabase'
import Dashboard from './components/Dashboard'
import AuthForm from './components/AuthForm'
import TradeForm from './components/TradeForm'
import './App.css'

export default function App() {
  // Demo mode - use a default user ID for testing
  const demoUserId = 'demo-user-001'
  const [session, setSession] = useState({ user: { id: demoUserId } })
  const [trades, setTrades] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load trades on mount
    loadTrades()
    setLoading(false)
  }, [])

  async function loadTrades() {
    try {
      const data = await fetchTrades(session.user.id, 200)
      setTrades(data)
    } catch (err) {
      console.error('Failed to load trades:', err)
    }
  }

  async function handleAddTrade(trade) {
    try {
      await supabase.from('trades').insert({
        ...trade,
        user_id: session.user.id,
      })
      await loadTrades()
      setShowForm(false)
    } catch (err) {
      alert('Error adding trade: ' + err.message)
    }
  }

  async function handleDeleteTrade(id) {
    if (!confirm('Delete this trade?')) return
    try {
      await supabase.from('trades').delete().eq('id', id)
      setTrades(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert('Error deleting trade: ' + err.message)
    }
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Trading Journal</h1>
      </header>

      <main className="container">
        {!showForm ? (
          <>
            <button 
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Add Trade
            </button>
            <Dashboard 
              trades={trades} 
              onDelete={handleDeleteTrade}
            />
          </>
        ) : (
          <TradeForm 
            onSubmit={handleAddTrade}
            onCancel={() => setShowForm(false)}
          />
        )}
      </main>
    </div>
  )
}

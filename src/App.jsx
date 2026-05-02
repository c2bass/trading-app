import { useEffect, useState } from 'react'
import { supabase, fetchTrades } from './lib/supabase'
import Dashboard from './components/Dashboard'
import TradeForm from './components/TradeForm'
import './App.css'

// PERMANENT DEMO MODE - NO AUTH, NO LOGIN SCREEN
export default function App() {
  const demoUserId = 'demo-user-001'
  const [trades, setTrades] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTrades(demoUserId, 200)
      .then(data => setTrades(data || []))
      .catch(err => {
        console.error('Failed to load trades:', err)
        setTrades([])
      })
  }, [])

  async function handleAddTrade(trade) {
    try {
      const { error } = await supabase.from('trades').insert({
        ...trade,
        user_id: demoUserId,
      })
      if (error) throw error
      const data = await fetchTrades(demoUserId, 200)
      setTrades(data || [])
      setShowForm(false)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  async function handleDeleteTrade(id) {
    if (!confirm('Delete this trade?')) return
    try {
      const { error } = await supabase.from('trades').delete().eq('id', id)
      if (error) throw error
      setTrades(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Trading Journal - Demo Mode</h1>
      </header>
      <main className="container">
        {!showForm ? (
          <>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              + Add Trade
            </button>
            <Dashboard trades={trades} onDelete={handleDeleteTrade} />
          </>
        ) : (
          <TradeForm onSubmit={handleAddTrade} onCancel={() => setShowForm(false)} />
        )}
      </main>
    </div>
  )
}

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
    loadTrades()
  }, [])

  async function loadTrades() {
    try {
      // Fetch all trades (no user_id filter since RLS is disabled and we don't store user_id)
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('entry_time', { ascending: false })
        .limit(200)
      
      if (error) throw error
      setTrades(data || [])

  async function handleAddTrade(trade) {
    try {
      // Insert the trade (don't include user_id since RLS is disabled)
      const { data, error: insertError } = await supabase.from('trades').insert(trade).select()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(insertError.message || 'Failed to save trade')
      }
      
      console.log('Trade saved successfully:', data)
      
      // Reload trades list
      await loadTrades()
      setShowForm(false)
      alert('Trade saved successfully!')
    } catch (err) {
      console.error('Error adding trade:', err)
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

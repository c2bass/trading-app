import { useState } from 'react'
import '../styles/form.css'

const ASSET_CLASSES = ['futures', 'forex', 'indices', 'metals']
const DIRECTIONS = ['long', 'short']
const EMOTIONS = ['confident', 'patient', 'neutral', 'anxious', 'fomo', 'fear', 'greedy']

export default function TradeForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    symbol: '',
    asset_class: 'futures',
    direction: 'long',
    entry_price: '',
    exit_price: '',
    quantity: '',
    fees: '0',
    emotion: '',
    notes: '',
    entry_time: new Date().toISOString().slice(0, 16),
    exit_time: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.symbol || !formData.entry_price || !formData.quantity || !formData.exit_price) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const priceDiff = parseFloat(formData.exit_price) - parseFloat(formData.entry_price)
      const side = formData.direction === 'long' ? 1 : -1
      const pnl = priceDiff * side * parseFloat(formData.quantity) - parseFloat(formData.fees)

      await onSubmit({
        ...formData,
        entry_price: parseFloat(formData.entry_price),
        exit_price: parseFloat(formData.exit_price),
        quantity: parseFloat(formData.quantity),
        fees: parseFloat(formData.fees),
        pnl: parseFloat(pnl.toFixed(2)),
        entry_time: new Date(formData.entry_time).toISOString(),
        exit_time: formData.exit_time ? new Date(formData.exit_time).toISOString() : null,
        status: 'closed',
      })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="trade-form">
      <h2>Add New Trade</h2>

      <div className="form-row">
        <div className="form-group">
          <label>Symbol *</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
            placeholder="e.g., ES, EURUSD"
            required
          />
        </div>

        <div className="form-group">
          <label>Asset Class *</label>
          <select
            value={formData.asset_class}
            onChange={(e) => setFormData({...formData, asset_class: e.target.value})}
          >
            {ASSET_CLASSES.map(ac => (
              <option key={ac} value={ac}>{ac.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Direction *</label>
          <select
            value={formData.direction}
            onChange={(e) => setFormData({...formData, direction: e.target.value})}
          >
            {DIRECTIONS.map(d => (
              <option key={d} value={d}>{d.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Entry Price *</label>
          <input
            type="number"
            step="0.001"
            value={formData.entry_price}
            onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Exit Price *</label>
          <input
            type="number"
            step="0.001"
            value={formData.exit_price}
            onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Quantity *</label>
          <input
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            placeholder="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Fees ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.fees}
            onChange={(e) => setFormData({...formData, fees: e.target.value})}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Entry Time</label>
          <input
            type="datetime-local"
            value={formData.entry_time}
            onChange={(e) => setFormData({...formData, entry_time: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Exit Time</label>
          <input
            type="datetime-local"
            value={formData.exit_time}
            onChange={(e) => setFormData({...formData, exit_time: e.target.value})}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Emotion</label>
        <div className="emotion-grid">
          {EMOTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setFormData({...formData, emotion: formData.emotion === e ? '' : e})}
              className={`emotion-btn ${formData.emotion === e ? 'active' : ''}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="What happened in this trade? Any lessons learned?"
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
  )
}

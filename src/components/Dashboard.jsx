import { format } from 'date-fns'
import '../styles/dashboard.css'

export default function Dashboard({ trades, onDelete }) {
  const closed = trades.filter(t => t.pnl !== null && t.pnl !== undefined)
  
  if (closed.length === 0) {
    return (
      <div className="empty-state">
        <p>No trades logged yet. Start by adding your first trade!</p>
      </div>
    )
  }

  const totalPnl = closed.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = closed.filter(t => t.pnl > 0).length
  const winRate = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total P&L</p>
          <p className={`stat-value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Win Rate</p>
          <p className="stat-value">{winRate}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Trades</p>
          <p className="stat-value">{closed.length}</p>
        </div>
      </div>

      <div className="trades-section">
        <h2>Recent Trades</h2>
        <div className="trades-list">
          {closed.map(trade => (
            <div key={trade.id} className="trade-row">
              <div className="trade-info">
                <h3>{trade.symbol}</h3>
                <p className="trade-meta">
                  {trade.direction.toUpperCase()} • {trade.asset_class}
                  {trade.emotion && ` • ${trade.emotion}`}
                </p>
                <p className="trade-time">
                  {format(new Date(trade.entry_time), 'MMM d, HH:mm')}
                </p>
                {trade.notes && <p className="trade-notes">{trade.notes}</p>}
              </div>
              <div className="trade-pnl">
                <p className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </p>
                <button
                  onClick={() => onDelete(trade.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

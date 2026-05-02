import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import '../styles/chart-replay.css'

export default function ChartReplay({ trade, onClose }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const [loading, setLoading] = useState(true)

  // Generate mock candlestick data based on entry/exit prices
  function generateMockData(entry, exit, entryTime, exitTime) {
    const entryDate = new Date(entryTime)
    const exitDate = new Date(exitTime)
    const timeRange = exitDate - entryDate
    const numCandles = Math.max(5, Math.ceil(timeRange / (15 * 60 * 1000))) // 15-min candles

    const candles = []
    const minPrice = Math.min(entry, exit) * 0.98
    const maxPrice = Math.max(entry, exit) * 1.02
    const priceRange = maxPrice - minPrice

    let currentPrice = entry
    let entryIndex = 0

    for (let i = 0; i < numCandles; i++) {
      const candleTime = new Date(entryDate.getTime() + (timeRange / numCandles) * i)
      const timestamp = Math.floor(candleTime.getTime() / 1000)

      // Gradually move price towards exit
      const progress = i / (numCandles - 1)
      const targetPrice = entry + (exit - entry) * progress

      // Add some realistic volatility
      const volatility = priceRange * 0.03
      const noise = (Math.random() - 0.5) * volatility

      currentPrice = targetPrice + noise

      // Create candle
      const open = currentPrice + (Math.random() - 0.5) * volatility * 0.5
      const close = currentPrice + (Math.random() - 0.5) * volatility * 0.5
      const high = Math.max(open, close) + Math.random() * volatility * 0.3
      const low = Math.min(open, close) - Math.random() * volatility * 0.3

      candles.push({
        time: timestamp,
        open: parseFloat(open.toFixed(4)),
        high: parseFloat(high.toFixed(4)),
        low: parseFloat(low.toFixed(4)),
        close: parseFloat(close.toFixed(4)),
      })

      if (i === 0) entryIndex = timestamp
    }

    return { candles, entryIndex: candles[0].time, exitIndex: candles[numCandles - 1].time }
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    const { candles, entryIndex, exitIndex } = generateMockData(
      trade.entry_price,
      trade.exit_price,
      trade.entry_time,
      trade.exit_time
    )

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: '#d1d5db',
        background: { color: '#1f2937' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    })

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
    })

    candlestickSeries.setData(candles)

    // Add entry marker (vertical line)
    const entryMarker = {
      time: entryIndex,
      position: 'inBar',
      color: '#3b82f6',
      shape: 'circle',
      text: 'Entry',
    }

    // Add exit marker
    const exitMarker = {
      time: exitIndex,
      position: 'inBar',
      color: '#f59e0b',
      shape: 'square',
      text: 'Exit',
    }

    candlestickSeries.setMarkers([entryMarker, exitMarker])

    // Add entry price line
    const entryLine = chart.addLineSeries({
      color: '#3b82f6',
      lineStyle: 2, // dashed
      lineWidth: 1,
      title: `Entry: $${trade.entry_price}`,
    })
    entryLine.setData([
      { time: candles[0].time, value: trade.entry_price },
      { time: candles[candles.length - 1].time, value: trade.entry_price },
    ])

    // Add exit price line
    const exitLine = chart.addLineSeries({
      color: '#f59e0b',
      lineStyle: 2, // dashed
      lineWidth: 1,
      title: `Exit: $${trade.exit_price}`,
    })
    exitLine.setData([
      { time: candles[0].time, value: trade.exit_price },
      { time: candles[candles.length - 1].time, value: trade.exit_price },
    ])

    // Fit content
    chart.timeScale().fitContent()

    chartRef.current = chart

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    setLoading(false)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [trade])

  return (
    <div className="chart-replay-modal">
      <div className="chart-replay-content">
        <div className="chart-replay-header">
          <h2>Chart Replay - {trade.symbol}</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="chart-replay-info">
          <div className="info-item">
            <span className="label">Direction:</span>
            <span className={trade.direction.toUpperCase()}>{trade.direction.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="label">Entry:</span>
            <span>${trade.entry_price.toFixed(4)}</span>
          </div>
          <div className="info-item">
            <span className="label">Exit:</span>
            <span>${trade.exit_price.toFixed(4)}</span>
          </div>
          <div className="info-item">
            <span className="label">P&L:</span>
            <span className={trade.pnl >= 0 ? 'positive' : 'negative'}>
              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Quantity:</span>
            <span>{trade.quantity}</span>
          </div>
        </div>

        {loading && <div className="loading">Loading chart...</div>}
        <div ref={chartContainerRef} className="chart-container" />

        <div className="chart-replay-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ borderColor: '#3b82f6' }}></span>
            Entry Price (Blue Dashed Line)
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ borderColor: '#f59e0b' }}></span>
            Exit Price (Orange Dashed Line)
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
            Up Candles (Green)
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
            Down Candles (Red)
          </div>
        </div>
      </div>
    </div>
  )
}

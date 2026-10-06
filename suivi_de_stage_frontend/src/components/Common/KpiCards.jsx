import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

function KpiCards({ items = [] }) {
  return (
    <div className="kpi-grid">
      {items.map((it, i) => (
        <div
          key={it.label ?? i}
          className={`kpi-card${it.featured ? ' kpi-card--featured' : ''}`}
        >
          <div className="kpi-card-top">
            <div
              className="kpi-icon"
              style={{ backgroundColor: it.bg, color: it.color }}
            >
              {it.icon}
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{it.value}</span>
              <span className="kpi-label">{it.label}</span>
            </div>
            {it.up !== undefined && (
              <div
                className="kpi-trend-badge"
                style={{
                  color: it.trendColor || it.color,
                  backgroundColor:
                    it.trendBg || `${(it.trendColor || it.color)}15`,
                }}
              >
                {it.up ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
              </div>
            )}
          </div>
          {it.change !== undefined && it.change !== null && (
            <div className="kpi-change" style={{ color: it.changeColor || it.color }}>
              {it.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default KpiCards;

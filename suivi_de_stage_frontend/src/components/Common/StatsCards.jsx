function StatsCards({ items = [], cols }) {
  const classes = ['stats-cards'];
  if (cols) classes.push(`stats-cards--${cols}`);

  return (
    <div className={classes.join(' ')}>
      {items.map((it, i) => (
        <div key={it.label ?? i} className="stat-card">
          <div
            className={`stat-icon ${it.variant || 'total'}`}
            style={it.iconStyle}
          >
            {it.icon}
          </div>
          <div className="stat-info">
            <span className="stat-value" style={it.valueStyle}>
              {it.value}
            </span>
            <span className="stat-label">{it.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;

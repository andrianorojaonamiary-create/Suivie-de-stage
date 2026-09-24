

function Card({ 
  children, 
  title = null, 
  icon = null, 
  className = '', 
  headerClassName = '',
  bodyClassName = '',
  ...props 
}) {
  return (
    <div className={`card-emit ${className}`} {...props}>
      {title && (
        <div className={`card-emit-header ${headerClassName}`}>
          {icon && <span className="card-emit-icon">{icon}</span>}
          <h3 className="card-emit-title">{title}</h3>
        </div>
      )}
      <div className={`card-emit-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

export default Card;
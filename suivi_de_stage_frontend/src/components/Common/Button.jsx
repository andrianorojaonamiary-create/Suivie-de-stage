

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  icon = null,
  ...props 
}) {
  const variantClasses = {
    primary: 'btn-emit-primary',
    secondary: 'btn-emit-secondary',
    outline: 'btn-emit-outline',
    danger: 'btn-emit-danger',
    success: 'btn-emit-success',
    warning: 'btn-emit-warning',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  return (
    <button
      type={type}
      className={`btn-emit ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
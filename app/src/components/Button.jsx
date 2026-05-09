import '../styles/buttons.css';

function Button({ variant = 'primary', type = 'button', disabled = false, onClick, children, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`button-${variant} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default Button;
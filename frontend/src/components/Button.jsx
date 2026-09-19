import { Link } from 'react-router-dom';

// variant: primary | secondary | danger | ghost      size: md | sm
// Pass `to` to render a link that looks like a button.
export default function Button({ children, variant = 'primary', size = 'md', to, loading = false, disabled = false, type = 'button', className = '', ...rest }) {
  const cls = `btn btn-${variant} btn-${size} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}

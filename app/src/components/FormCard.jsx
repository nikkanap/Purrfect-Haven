/**
 * FormCard - Reusable form card container component
 * 
 * Provides a consistent card-based form layout with:
 * - Centered container with consistent padding
 * - Optional title and subtitle text
 * - Support for custom styling and className
 * - Flexible content via children prop
 * 
 * Usage:
 * <FormCard title="Welcome" subtitle="Sign in to continue">
 *   <form>...</form>
 * </FormCard>
 * 
 * Props:
 *   - title (string): Optional heading text
 *   - subtitle (string|node): Optional subtitle/description
 *   - children (node): Form or form content
 *   - maxWidth (number): Max width in pixels (default: 500)
 *   - className (string): Custom card classes
 *   - containerClassName (string): Custom container classes
 */

function FormCard({
  title,
  subtitle,
  children,
  maxWidth = 500,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`form-card-container ${containerClassName}`}>
      <div className={`form-card ${className}`} style={{ maxWidth: `${maxWidth}px` }} {...props}>
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default FormCard;

import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary: 'border border-line bg-paper text-ink hover:bg-cream active:bg-line/50 disabled:text-muted',
  ghost: 'text-ink hover:bg-ink/5 active:bg-ink/10 disabled:text-muted',
  danger: 'bg-chili text-white hover:bg-red-800 disabled:bg-red-300',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:text-brand-300',
  dark: 'bg-ink text-white hover:bg-ink/90 disabled:bg-ink/40',
};
const SIZES = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-5 text-base',
  icon: 'size-10 rounded-xl',
  iconSm: 'size-8 rounded-lg',
};

const BASE =
  'inline-flex shrink-0 items-center justify-center font-semibold transition-[background-color,color,transform] duration-150 select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100';

export const buttonClasses = ({ variant = 'primary', size = 'md', className = '' } = {}) =>
  `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

/** A router link that looks like a button (never nest <button> inside <a>). */
export function ButtonLink({ variant, size, className, icon: Icon, children, ...props }) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
    </Link>
  );
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, className = '', children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
});

export default Button;

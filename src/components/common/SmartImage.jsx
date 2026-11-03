import { UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { assetUrl } from '../../services/api';

const PALETTES = [
  'from-amber-100 to-orange-200 text-orange-700',
  'from-rose-100 to-red-200 text-red-700',
  'from-lime-100 to-green-200 text-green-700',
  'from-yellow-100 to-amber-200 text-amber-700',
  'from-orange-100 to-rose-200 text-rose-700',
];

/**
 * Lazy image with a fixed box (no layout shift), a soft fade-in, and a
 * warm placeholder showing the dish initial when there is no photo.
 */
export default function SmartImage({ src, alt = '', className = '', eager = false, seed = alt }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = assetUrl(src);
  const palette = PALETTES[[...(seed || 'x')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTES.length];

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${palette} ${className}`}>
      {(!url || failed) && (
        <div className="absolute inset-0 grid place-items-center">
          {alt ? (
            <span className="font-display text-3xl font-semibold opacity-70">{[...alt][0]}</span>
          ) : (
            <UtensilsCrossed className="size-1/3 opacity-60" />
          )}
        </div>
      )}
      {url && !failed && (
        <img
          src={url}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

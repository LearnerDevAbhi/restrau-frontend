import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { assetUrl } from '../../services/api';
import { useT } from '../../hooks/useT';
import { formatBytes } from '../../utils/format';
import { prepareImage } from '../../utils/image';
import Spinner from '../common/Spinner';

/**
 * Validates type (JPG/PNG/WebP) and size (≤ 2 MB), downsizes the photo in the
 * browser, and hands back a Base64 data URI ready for the API.
 *
 * value: { preview: string|null, info?: { originalBytes, bytes } }
 */
export default function ImageUploader({ value, onChange, aspect = 'aspect-[4/3]', label, hint }) {
  const { t } = useT();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const { dataUri, originalBytes, bytes } = await prepareImage(file);
      onChange({ preview: dataUri, dataUri, info: { originalBytes, bytes } });
    } catch (e) {
      setError(t(`errors.${e.code || 'INVALID_IMAGE'}`));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const preview = value?.preview ? (value.preview.startsWith('data:') ? value.preview : assetUrl(value.preview)) : null;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${aspect} ${
          dragging ? 'border-brand-500 bg-brand-50' : error ? 'border-chili/50 bg-red-50/40' : 'border-line bg-cream'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-10">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white"
              >
                <RefreshCw className="size-3.5" />
                {t('itemForm.imageChange')}
              </button>
              <button
                type="button"
                onClick={() => onChange({ preview: null, dataUri: null, removed: true })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-chili hover:bg-white"
              >
                <Trash2 className="size-3.5" />
                {t('itemForm.imageRemove')}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-muted hover:text-ink"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-sm">
              <ImagePlus className="size-6 text-brand-600" />
            </span>
            <span className="text-sm font-medium">{t('itemForm.imageDrop')}</span>
            <span className="text-xs">{hint ?? t('itemForm.imageHint')}</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper/85 text-sm font-medium text-brand-700">
            <Spinner />
            {t('itemForm.imageProcessing')}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error ? (
        <p className="text-xs font-medium text-chili">{error}</p>
      ) : value?.info && value.info.bytes < value.info.originalBytes ? (
        <p className="text-xs text-leaf">
          {t('itemForm.imageOptimized', { from: formatBytes(value.info.originalBytes), to: formatBytes(value.info.bytes) })}
        </p>
      ) : null}
    </div>
  );
}

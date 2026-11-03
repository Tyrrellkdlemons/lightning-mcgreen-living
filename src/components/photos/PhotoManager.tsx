'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, LockKeyhole, Upload } from 'lucide-react';
import type { PhotoTarget, PhotoTargetKind } from '@/lib/photos/types';
import { filterPhotoTargets } from '@/lib/photos/targets.mjs';
import { PlaceGallery } from './PlaceGallery';

const MAX_BYTES = 4 * 1024 * 1024;
const inputClass = 'mt-2 block min-h-11 w-full rounded-xl border border-gingerbread-300 bg-white px-3 py-2 text-base text-chocolate-900 focus:border-lightning-800 focus:outline-none focus:ring-2 focus:ring-lightning-700';
const groups: { kind: PhotoTargetKind; label: string }[] = [
  { kind: 'city', label: 'City guides' }, { kind: 'workbook', label: 'Workbook properties' },
  { kind: 'rental', label: 'Rental records (area examples labeled)' }, { kind: 'property-source', label: 'Property sources' },
];

async function preparePhoto(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_BYTES) {
    throw new Error('Choose a JPEG, PNG, or WebP image under 4 MB.');
  }
  const bitmap = await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40000000) {
      throw new Error('Choose a photo smaller than 40 megapixels.');
    }
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const drawing = canvas.getContext('2d');
    if (!drawing) throw new Error('This browser could not prepare the image. Try an updated browser.');
    drawing.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Re-encoding removes camera EXIF/location metadata before the photo leaves the browser.
    const result = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('The photo could not be prepared.')),
      'image/webp', 0.88,
    ));
    if (result.size > MAX_BYTES) throw new Error('This image is still too large. Choose a smaller photo.');
    return result;
  } finally { bitmap.close(); }
}

export function PhotoManager({ targets }: { targets: PhotoTarget[] }) {
  const [secret, setSecret] = useState('');
  const [placeId, setPlaceId] = useState(targets[0]?.id || '');
  const [query, setQuery] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [setupCheck, setSetupCheck] = useState(0);
  const [setupError, setSetupError] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [environment, setEnvironment] = useState('');
  const uploadId = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selection = useRef(0);
  const request = useRef<AbortController | null>(null);
  const selected = targets.find((target) => target.id === placeId);
  const matches = filterPhotoTargets(targets, query) as PhotoTarget[];
  // Keep the selected destination visible when a search narrows the options.
  const selectedOutsideSearch = selected && !matches.some(target => target.id === placeId);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let active = true;
    fetch('/api/place-photos/status', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('unavailable');
        const data = await response.json();
        if (typeof data.configured !== 'boolean') throw new Error('invalid');
        if (active) setConfigured(data.configured);
      }).catch(() => { if (active) { setConfigured(null); setSetupError(true); } })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [setupCheck]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    // Invalidate the current async selection, not a captured sequence number.
    const invalidatePreparation = () => { selection.current++; };
    const clear = () => { invalidatePreparation(); setPreparing(false); setSecret(''); request.current?.abort(); };
    window.addEventListener('pagehide', clear);
    return () => { invalidatePreparation(); window.removeEventListener('pagehide', clear); request.current?.abort(); };
  }, []);

  async function choosePhoto(file?: File) {
    const currentSelection = ++selection.current;
    setPhoto(null); setPreview(''); setMessage(''); setSuccess(false); uploadId.current = null;
    if (!file) { setPreparing(false); return; }
    setPreparing(true);
    try {
      const prepared = await preparePhoto(file);
      if (currentSelection === selection.current) { setPhoto(prepared); setPreview(URL.createObjectURL(prepared)); }
    } catch (error) {
      if (currentSelection === selection.current) setMessage(error instanceof Error ? error.message : 'Choose another photo.');
    } finally {
      if (currentSelection === selection.current) setPreparing(false);
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !photo || !selected || configured === false) return;
    if (secret.length < 32) { setMessage('Enter the editor access key to publish.'); setSuccess(false); return; }
    const form = new FormData(event.currentTarget);
    // Access keys never become part of multipart data, URLs, browser storage, or logs.
    form.delete('editor-key');
    form.set('placeId', selected.id);
    form.set('targetKind', selected.kind);
    form.set('photo', photo, photo.type === 'image/webp' ? 'place.webp' : 'place.png');
    uploadId.current ||= crypto.randomUUID();
    form.set('uploadId', uploadId.current);
    form.set('consent', 'yes');
    setBusy(true); setSuccess(false); setMessage('Uploading and confirming publication...');
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/place-photos/upload', {
        method: 'POST', headers: { 'x-admin-secret': secret }, body: form,
        signal: controller.signal, credentials: 'same-origin',
      });
      const data = await response.json().catch(() => ({ error: 'The photo service is unavailable.' }));
      if (!response.ok) throw new Error(data.error || 'The photo could not be published.');
      setEnvironment(data.environment || '');
      setMessage(data.duplicate ? 'This photo is already published. No duplicate was created.' : 'Photo published to ' + selected.label + '. Its credit and caption appear in the collection below.');
      setSuccess(true); setPhoto(null); setPreview(''); uploadId.current = null;
      if (fileInput.current) fileInput.current.value = '';
      setGeneration((value) => value + 1);
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'AbortError' ? error.message :
        'We could not confirm publication. Retry without changing the form; the upload reference prevents duplicates.');
    } finally {
      clearTimeout(timer); request.current = null; setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={publish} onChange={() => { if (!busy) uploadId.current = null; }} className="mt-8 space-y-6 rounded-3xl border border-gingerbread-200 bg-frosting-50 p-5 sm:p-8">
        <div className="rounded-2xl border border-gingerbread-200 bg-white p-4">
          <label htmlFor="photo-editor-key" className="flex items-center gap-2 font-bold text-chocolate-900">
            <LockKeyhole size={18} aria-hidden="true" /> Editor access key
          </label>
          <input id="photo-editor-key" name="editor-key" type="password" value={secret} disabled={busy}
            onChange={(event) => setSecret(event.target.value)} autoComplete="off" spellCheck={false}
            maxLength={512} className={inputClass} aria-describedby="key-help" />
          <p id="key-help" className="mt-2 text-xs text-chocolate-700">Use your site&apos;s private editor key. It stays in this page&apos;s memory and is sent only when you publish.</p>
          <p role="status" className="mt-3 text-sm text-chocolate-700">{configured === false ? 'Publishing is not configured for this deployment. The site owner must configure the private editor key before uploading.' : configured === true ? 'Publishing is configured. Your private editor key is still required and is checked when you publish.' : setupError ? 'We could not check publishing setup. You can retry the check or submit with your editor key.' : 'Checking publishing setup...'}</p>
          <button type="button" disabled={busy} onClick={() => { setSetupError(false); setSetupCheck(value => value + 1); }} className="mt-1 min-h-11 text-sm font-semibold text-lightning-800 underline">Check publishing setup again</button>
          {secret && <button type="button" disabled={busy} onClick={() => setSecret('')} className="mt-2 min-h-11 text-sm font-semibold text-lightning-800 underline">Clear access key</button>}
        </div>

        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <legend className="mb-4 font-display text-xl font-extrabold text-chocolate-900">Add a place or property photograph</legend>
          <label className="block text-sm font-semibold text-chocolate-900">Find a destination
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} className={inputClass} placeholder="Search property, city, state, or record ID" aria-describedby="photo-target-count" />
          </label>
          <p id="photo-target-count" role="status" className="text-xs text-chocolate-700">{matches.length} of {targets.length} destinations match. Choose the exact record below.</p>
          <label className="block text-sm font-semibold text-chocolate-900">Photo destination
            <select name="placeId" value={placeId} onChange={(event) => setPlaceId(event.target.value)} className={`${inputClass} min-w-0 max-w-full`} required>
              {selectedOutsideSearch && <optgroup label="Current selection (outside search)"><option value={selected.id}>{selected.label}, {selected.state}{selected.contextOnly && selected.kind !== 'city' ? ' - Area example' : ''}</option></optgroup>}
              {groups.map(group => {
                const options = matches.filter(target => target.kind === group.kind);
                return options.length > 0 ? <optgroup key={group.kind} label={group.label}>{options.map(target => <option key={target.id} value={target.id}>{target.label}{target.city && target.city !== target.label ? ', ' + target.city : ''}, {target.state}{target.contextOnly && target.kind !== 'city' ? ' - Area example' : ''} ({target.id})</option>)}</optgroup> : null;
              })}
            </select>
          </label>
          {selected && <div className="rounded-xl border border-gingerbread-200 bg-white p-4 text-sm text-chocolate-700">
            <p className="font-bold text-chocolate-900">Selected: {selected.label}, {selected.state}</p>
            <p className="mt-2">{selected.contextOnly ? 'Area context only. This record does not identify an exact available rental unit; publish neighborhood photographs without presenting them as unit photos.' : 'Publish photographs that match this specific property record. Identify model units, shared spaces, and the date or context in the caption; a photograph does not confirm current availability.'}</p>
            <Link href={selected.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-semibold text-lightning-800 underline">Open the selected page</Link>
          </div>}
          <label className="block text-sm font-semibold text-chocolate-900">Photograph
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void choosePhoto(event.target.files?.[0])}
              className="mt-2 block min-h-11 w-full rounded-xl border border-dashed border-gingerbread-300 bg-white p-3 text-sm" />
          </label>
          <p className="text-xs text-chocolate-700">JPEG, PNG, or WebP  /  Up to 4 MB. We resize large photos and remove camera location metadata before upload. Avoid faces, documents, license plates, and confidential shelter locations.</p>
          {preparing && <p role="status" className="text-sm text-chocolate-700">Preparing your photograph...</p>}
          {preview && <div className="overflow-hidden rounded-2xl bg-white p-2"><Image src={preview} alt="Preview of the photograph selected for publication" width={800} height={600} unoptimized className="max-h-80 w-full rounded-xl object-contain" /></div>}

          <label className="block text-sm font-semibold text-chocolate-900">Image description (alt text)
            <input name="alt" required maxLength={240} className={inputClass} placeholder="Describe what is visible for someone who cannot see the photo" />
          </label>
          <label className="block text-sm font-semibold text-chocolate-900">Caption
            <textarea name="caption" maxLength={500} rows={3} className={inputClass} placeholder="Name the place and explain the scene. Do not imply a unit is available." />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-chocolate-900">Photographer or credit
              <input name="credit" required maxLength={160} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold text-chocolate-900">Source link (optional)
              <input name="sourceUrl" type="url" maxLength={500} className={inputClass} placeholder="https://" />
            </label>
          </div>
          <label className="block text-sm font-semibold text-chocolate-900">Permission to share
            <select name="rights" required className={inputClass}>
              <option value="owned">I own this photograph</option>
              <option value="permission">I have the photographer&apos;s permission</option>
              <option value="licensed">A license allows this public use</option>
            </select>
          </label>
          <label className="flex min-h-11 items-start gap-3 text-sm text-chocolate-700">
            <input type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-lightning-800" />
            <span>I confirm the credit and description are accurate, I have the right to publish this photo, and it contains no private or confidential information.</span>
          </label>
          <button type="submit" disabled={busy || preparing || !photo || !secret || !selected || configured === false} className="bolt-btn inline-flex min-h-12 items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <Upload size={18} aria-hidden="true" /> {busy ? 'Publishing...' : 'Publish photograph'}
          </button>
        </fieldset>
        {message && <p role={success ? 'status' : 'alert'} className={'rounded-xl border p-4 text-sm ' + (success ? 'border-lightning-200 bg-lightning-50 text-lightning-950' : 'border-gingerbread-300 bg-white text-chocolate-900')}>{message}</p>}
        {environment && environment !== 'production' && <p className="text-sm font-semibold text-chocolate-900">Preview collection: this photograph was not added to the live site.</p>}
      </form>
      <div className="mt-8 flex items-center gap-2 text-xs text-chocolate-700"><Camera size={16} aria-hidden="true" /> Current collection for {selected?.label || 'this destination'}</div>
      {selected && <PlaceGallery key={placeId + generation} placeId={placeId} name={selected.label} targetKind={selected.kind} contextOnly={selected.contextOnly} />}
    </>
  );
}

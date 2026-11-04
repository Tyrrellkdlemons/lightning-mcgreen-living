'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { assistanceLogoSource } from '@/lib/assistance-directory/model';
export function AssistanceLogo({ imageKey, name }: { imageKey?: string; name: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = assistanceLogoSource(imageKey);
  return <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-lightning-100 text-lightning-900">
    {source && failedSource !== source ? <Image src={source} width={44} height={44} sizes="44px" alt={`${name} logo`} className="h-11 w-11 object-contain" loading="lazy" loader={({ src, width }) => `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&h=${width}&fit=contain&q=80`} onError={() => setFailedSource(source)} /> : <Building2 className="h-5 w-5" aria-hidden="true" />}
  </span>;
}

'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Camera, ImageOff } from 'lucide-react';
import type { HomePhoto as Photo } from '@/lib/homes';
export function HomePhoto({photos,name}: {photos:Photo[];name:string}) {
  const [loaded,setLoaded]=useState(false), [failed,setFailed]=useState(false);
  const photo=photos[0];
  return <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-frosting-100">
    {loaded && photo && !failed ? <Image src={photo.url} alt={`${name}: ${photo.title}`} fill unoptimized sizes="(max-width: 640px) 90vw, 420px" className="object-cover" onError={()=>setFailed(true)}/> : <div className="flex flex-col items-center gap-3 p-5 text-center text-chocolate-700">{failed?<ImageOff size={26}/>:<Camera size={26}/>}<p className="text-sm">{failed?'Photo unavailable. Open the publisher gallery.':photo?'Property photo from the publisher':'Open property details for gallery links'}</p>{photo&&!failed&&<button className="cinnamon-btn text-sm" onClick={()=>setLoaded(true)}>Load property photo</button>}</div>}
    {loaded&&photo&&<a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold underline">Publisher gallery · capture date unconfirmed ↗</a>}
  </div>;
}

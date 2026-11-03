export type PhotoTargetKind = 'city' | 'workbook' | 'rental' | 'property-source';
export interface PhotoTarget {
  id: string;
  kind: PhotoTargetKind;
  label: string;
  city: string;
  state: 'CA' | 'AZ';
  href: string;
  contextOnly: boolean;
}

export interface PlacePhoto {
  id: string;
  placeId: string;
  alt: string;
  caption: string;
  credit: string;
  sourceUrl: string;
  rights: 'owned' | 'permission' | 'licensed';
  createdAt: string;
  url: string;
  target?: PhotoTarget;
}

export function photoUrl(source: string, width: number) {
  return '/.netlify/images?url=' + encodeURIComponent(source) +
    '&w=' + width + '&h=' + Math.round(width * 0.75) + '&fit=cover&q=80';
}

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
}

export function photoUrl(source: string, width: number) {
  return '/.netlify/images?url=' + encodeURIComponent(source) +
    '&w=' + width + '&h=' + Math.round(width * 0.75) + '&fit=cover&q=80';
}

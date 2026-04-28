/**
 * Free-license seeded image sets via Lorem Picsum (https://picsum.photos).
 *
 * Lorem Picsum is a free, no-API-key proxy over the Unsplash library. Images
 * are CC0-licensed and stable per `seed`. We pick three seeds per topic so the
 * card and detail-page galleries can crossfade.
 *
 * For Path 2 (per-property photo links), each listing optionally carries an
 * `official_image_credit_url` we can also link out to.
 */

export interface PhotoSet {
  /** 3 stable seeded URLs that look reasonable as apartment / townhome / car / van photos. */
  urls: [string, string, string];
  alt: string;
  credit_label: string;
  credit_url: string;
}

const PICSUM = (seed: string, w = 800, h = 520) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const CREDIT = {
  label: 'Free-license demo photo (Lorem Picsum / Unsplash CC0)',
  url: 'https://picsum.photos/',
};

export function apartmentPhotos(seedKey: string): PhotoSet {
  return {
    urls: [
      PICSUM(`apt-${seedKey}-1`),
      PICSUM(`apt-${seedKey}-2`),
      PICSUM(`apt-${seedKey}-3`),
    ],
    alt: 'Apartment community exterior · demo photo',
    credit_label: CREDIT.label,
    credit_url: CREDIT.url,
  };
}

export function townhomePhotos(seedKey: string): PhotoSet {
  return {
    urls: [
      PICSUM(`th-${seedKey}-1`),
      PICSUM(`th-${seedKey}-2`),
      PICSUM(`th-${seedKey}-3`),
    ],
    alt: 'Townhome community · demo photo',
    credit_label: CREDIT.label,
    credit_url: CREDIT.url,
  };
}

export function vehiclePhotos(seedKey: string): PhotoSet {
  return {
    urls: [
      PICSUM(`car-${seedKey}-1`),
      PICSUM(`car-${seedKey}-2`),
      PICSUM(`car-${seedKey}-3`),
    ],
    alt: 'Vehicle · demo photo',
    credit_label: CREDIT.label,
    credit_url: CREDIT.url,
  };
}

export function workVehiclePhotos(seedKey: string): PhotoSet {
  return {
    urls: [
      PICSUM(`van-${seedKey}-1`),
      PICSUM(`van-${seedKey}-2`),
      PICSUM(`van-${seedKey}-3`),
    ],
    alt: 'Work vehicle · demo photo',
    credit_label: CREDIT.label,
    credit_url: CREDIT.url,
  };
}

import type { SliderImage } from '../components/ImageSlider';

export interface InstitutionGroup {
  id: string;
  title: string;
  images: readonly SliderImage[];
}

export const INSTITUTION_GROUPS: readonly InstitutionGroup[] = [
  {
    id: 'tvet',
    title: 'TVET College',
    images: [
      { src: '/institutions/tshwane-tvet.png', alt: 'Tshwane TVET College' },
      { src: '/institutions/ewc.png', alt: 'EWC TVET College' },
      { src: '/institutions/kzn-tvet.png', alt: 'KwaZulu-Natal TVET College' },
    ],
  },
  {
    id: 'private',
    title: 'Private University/College',
    images: [
      { src: '/institutions/eduvos.jpg', alt: 'Eduvos' },
      { src: '/institutions/emeris.png', alt: 'Emeris' },
      { src: '/institutions/stadio.png', alt: 'STADIO' },
    ],
  },
  {
    id: 'public',
    title: 'Public University',
    images: [
      { src: '/institutions/wits.png', alt: 'University of the Witwatersrand' },
      { src: '/institutions/up.jpg', alt: 'University of Pretoria' },
      { src: '/institutions/uct.jpg', alt: 'University of Cape Town' },
    ],
  },
];

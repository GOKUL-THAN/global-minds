import type { Location } from '../types';

export const locations: Location[] = [
  {
    id: 'loc1',
    slug: 'chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    address: '123 IT Corridor, Placeholder Area, Chennai – 600001. [PLACEHOLDER — update with real address]',
    phone: '+91 99999 00001',
    email: 'chennai@globalmindstechnologies.com',
    mapUrl: 'https://maps.google.com',
    courses: [
      'aws-training',
      'data-science',
      'machine-learning',
      'full-stack-development',
      'cyber-security',
      'software-testing',
      'automation-testing',
    ],
    facilities: ['Air-conditioned classrooms', 'Computer labs', 'High-speed Wi-Fi', 'Library', 'Cafeteria', 'Placement cell'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop',
    active: true,
    lat: 13.0827,
    lng: 80.2707,
  },
];

export const getActiveLocations = () => locations.filter(l => l.active);
export const getLocationBySlug = (slug: string) => locations.find(l => l.slug === slug);

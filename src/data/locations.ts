import type { Location } from '../types';

export const locations: Location[] = [
  {
    id: 'loc1',
    slug: 'chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    address: 'Nookampalayam Road, Perumbakkam, Chennai – 600 100, Tamil Nadu, India',
    phone: '+91 95974 37333',
    email: 'connect@globalmindstechnologies.com',
    mapUrl: 'https://maps.google.com',
    courses: [
      'aws-training',
      'data-science',
      'ai-ml-engineering',
      'machine-learning',
      'full-stack-development',
      'cyber-security',
      'software-and-automation-testing',
      'campus-to-corporate-bridge-course',
      'tech-communication-language'
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

export interface Scholarship {
  id: string;
  icon: string;
  title: string;
  discount: string;
  badge: string;
  badgeColor: string;
  description: string;
  eligibility: string[];
  howToApply: string;
  color: string;
}

export const scholarships: Scholarship[] = [
  {
    id: 'merit',
    icon: '🏆',
    title: 'Merit Scholarship',
    discount: 'Up to 50% Off',
    badge: 'Most Popular',
    badgeColor: 'bg-brand-100 text-brand-700',
    description: 'For students who score 80% or above in our free skill assessment test. Rewards academic excellence.',
    eligibility: ['Score 80%+ in skill assessment', 'Any degree / diploma', 'Fresh enrollment only'],
    howToApply: 'Take the free skill assessment on our website. Qualifying scores automatically trigger a scholarship offer.',
    color: 'border-brand-200 bg-brand-50',
  },
  {
    id: 'fresher',
    icon: '🎓',
    title: 'Fresher / Student Scholarship',
    discount: '30% Off',
    badge: 'Freshers',
    badgeColor: 'bg-green-100 text-green-700',
    description: 'Exclusive discount for recent graduates and final year students entering the IT industry.',
    eligibility: ['Final year or recently graduated (within 1 year)', 'Valid college ID required', 'Any stream / degree'],
    howToApply: 'Apply online and upload your college ID or marksheet. Our team verifies within 24 hours.',
    color: 'border-green-200 bg-green-50',
  },
  {
    id: 'women',
    icon: '👩‍💻',
    title: 'Women in Tech Scholarship',
    discount: '40% Off',
    badge: 'Special Initiative',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Supporting gender diversity in technology. Special discount for women professionals and students.',
    eligibility: ['Identifies as a woman', 'Any background — IT or non-IT', 'All courses eligible'],
    howToApply: 'Fill out the scholarship application form and mention "Women in Tech" in the comments.',
    color: 'border-purple-200 bg-purple-50',
  },
  {
    id: 'referral',
    icon: '🤝',
    title: 'Referral Discount',
    discount: '₹3,000 Off',
    badge: 'Refer & Save',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Get ₹3,000 off your enrollment fee when referred by an existing or past student.',
    eligibility: ['Referred by a current or alumni student', 'Valid referral code required', 'Stackable with select offers'],
    howToApply: 'Get a referral code from your friend and enter it at checkout. Discount applied instantly.',
    color: 'border-orange-200 bg-orange-50',
  },
  {
    id: 'corporate',
    icon: '🏢',
    title: 'Group / Corporate Discount',
    discount: 'Up to 30% Off',
    badge: 'Teams',
    badgeColor: 'bg-sky-100 text-sky-700',
    description: 'Special pricing for companies enrolling 3 or more employees for upskilling programs.',
    eligibility: ['Minimum 3 employees enrolling together', 'Same or different courses', 'Invoice billing available'],
    howToApply: 'Contact our corporate team with the number of employees and preferred courses.',
    color: 'border-sky-200 bg-sky-50',
  },
  {
    id: 'early',
    icon: '⚡',
    title: 'Early Bird Offer',
    discount: '₹2,000 Off',
    badge: 'Limited Time',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    description: 'Enroll at least 15 days before a batch starts to get an early bird discount.',
    eligibility: ['Enroll 15+ days before batch start', 'Pay full fee upfront', 'All courses eligible'],
    howToApply: 'Select your batch on the batch schedule page. The early bird price is automatically shown for eligible batches.',
    color: 'border-yellow-200 bg-yellow-50',
  },
];

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  priceRange: string;
  category: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  videoUrl?: string;
  galleryImages?: string[];
}

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Addis Jazz Festival 2025',
    date: 'Sat, Dec 20 • 6:00 PM',
    location: 'Ghion Hotel, Addis Ababa',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80',
    priceRange: '500 - 1500 ETB',
    category: 'Music',
    isFeatured: true,
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    galleryImages: [
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
    ],
  },
  {
    id: '2',
    title: 'Tech & Innovation Expo',
    date: 'Sun, Dec 21 • 9:00 AM',
    location: 'Skylight Hotel',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop&q=80',
    priceRange: 'Free Entry',
    category: 'Business',
    isTrending: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
    ],
  },
  {
    id: '3',
    title: 'Great Ethiopian Run After-Party',
    date: 'Sun, Nov 16 • 2:00 PM',
    location: 'Friendship Park',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80',
    priceRange: '300 ETB',
    category: 'Social',
    isFeatured: true,
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: '4',
    title: 'Art of Ethiopia Gallery Opening',
    date: 'Fri, Dec 26 • 5:00 PM',
    location: 'Entoto Park Art Center',
    imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop&q=80',
    priceRange: '200 ETB',
    category: 'Arts',
    isTrending: true,
    galleryImages: [
      'https://images.unsplash.com/photo-1518998053901-5348d3969105?w=800&q=80',
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
    ],
  },
  {
    id: '5',
    title: 'Taste of Addis Food Festival',
    date: 'Sat, Jan 10 • 11:00 AM',
    location: 'Meskel Square',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
    priceRange: '100 ETB',
    category: 'Food',
    isTrending: true,
  },
  {
    id: '6',
    title: 'Ethiopian Fashion Week',
    date: 'Fri, Jan 16 • 7:00 PM',
    location: 'Sheraton Addis',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
    priceRange: '1000 ETB',
    category: 'Fashion',
    isFeatured: true,
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
];

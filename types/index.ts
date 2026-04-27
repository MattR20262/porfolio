export interface Project {
  id: string
  title: string
  slug: string
  short_description: string | null
  full_description: string | null
  category: string
  collection_id: string | null
  cover_image: string | null
  cover_image_public_id: string | null
  featured: boolean
  published: boolean
  location: string | null
  shoot_date: string | null
  client_name: string | null
  seo_title: string | null
  seo_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProjectMedia {
  id: string
  project_id: string
  media_type: 'image' | 'video'
  url: string
  public_id: string
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image: string | null
  cover_image_public_id: string | null
  featured: boolean
  visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  full_name: string
  email: string
  phone: string | null
  service_type: string
  event_date: string | null
  location: string | null
  budget: string | null
  message: string
  status: 'new' | 'pending' | 'confirmed' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  role_or_event: string | null
  quote: string
  image: string | null
  featured: boolean
  sort_order: number
  created_at: string
}

export interface MediaAsset {
  id: string
  filename: string
  url: string
  public_id: string
  resource_type: 'image' | 'video'
  format: string
  size: number
  width: number | null
  height: number | null
  alt_text: string | null
  project_id: string | null
  created_at: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
  show_in_nav: boolean
  nav_parent: string | null
  seo_title: string | null
  seo_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SiteContent {
  id: string
  key: string
  value: string
  type: 'text' | 'html' | 'url'
  updated_at: string
}

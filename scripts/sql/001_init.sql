CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  auth_provider TEXT NOT NULL,
  profile_picture_url TEXT,
  bio TEXT,
  loyalty_points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Bronze',
  user_type TEXT DEFAULT 'foodie',
  restaurant_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  latitude DOUBLE PRECISION DEFAULT 0,
  longitude DOUBLE PRECISION DEFAULT 0,
  cuisine_type TEXT DEFAULT 'Unknown',
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  encryption_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_photos (
  id TEXT PRIMARY KEY,
  review_id TEXT REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  description TEXT,
  type TEXT,
  value NUMERIC,
  terms TEXT
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  offer_id TEXT,
  encrypted_code TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redemptions (
  id TEXT PRIMARY KEY,
  promotion_id TEXT REFERENCES promotions(id) ON DELETE CASCADE,
  redeemed_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followers (
  follower_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

-- Recommended indexes
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_combo ON redemptions(promotion_id, redeemed_by_user_id);

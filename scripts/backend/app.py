from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os, base64, json, secrets
import psycopg2
import psycopg2.extras
import bcrypt
import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET'] = "Ganesh73005#"
DATABASE_URL = "postgresql://postgres:ganesh@localhost:5432/foodie"  # e.g. postgres://...

def db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def authed_user():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '): return None
    token = auth.split(' ',1)[1]
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload
    except Exception:
        return None

def generate_token(user_id):
    payload = { 'uid': user_id, 'exp': datetime.utcnow() + timedelta(days=14) }
    return jwt.encode(payload, app.config['JWT_SECRET'], algorithm='HS256')

def get_restaurant_key(restaurant_id: str) -> bytes:
    # Store per-restaurant 32-byte keys in DB; here we fetch or create on demand
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT encryption_key FROM restaurants WHERE id=%s", (restaurant_id,))
        row = cur.fetchone()
        if row and row['encryption_key']:
            return base64.urlsafe_b64decode(row['encryption_key'])
        key = AESGCM.generate_key(bit_length=256)
        cur.execute("UPDATE restaurants SET encryption_key=%s WHERE id=%s", (base64.urlsafe_b64encode(key).decode(), restaurant_id))
        conn.commit()
        return key

def encrypt_code(restaurant_id: str, payload: dict) -> str:
    key = get_restaurant_key(restaurant_id)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, json.dumps(payload).encode(), None)
    return base64.urlsafe_b64encode(nonce + ct).decode()

def decrypt_code(restaurant_id: str, code_b64: str) -> dict:
    key = get_restaurant_key(restaurant_id)
    raw = base64.urlsafe_b64decode(code_b64.encode())
    nonce, ct = raw[:12], raw[12:]
    aesgcm = AESGCM(key)
    pt = aesgcm.decrypt(nonce, ct, None)
    return json.loads(pt.decode())

@app.post('/api/auth/register/foodie')
def register_foodie():
    data = request.get_json()
    username, email, password = data.get('username'), data.get('email'), data.get('password')
    if not all([username, email, password]): return ('Missing fields', 400)
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    uid = secrets.token_hex(8)
    with db() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO users (id, username, email, password_hash, auth_provider, loyalty_points, level) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (uid, username, email, pw_hash, 'email', 0, 'Bronze'))
        conn.commit()
    return jsonify({ 'ok': True })

@app.post('/api/auth/register/restaurant')
def register_restaurant():
    data = request.get_json()
    username, email, password = data.get('username'), data.get('email'), data.get('password')
    if not all([username, email, password]): return ('Missing fields', 400)
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    uid = secrets.token_hex(8)
    rid = secrets.token_hex(8)
    with db() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO users (id, username, email, password_hash, auth_provider, loyalty_points, level, user_type, restaurant_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                    (uid, username, email, pw_hash, 'email', 0, 'Bronze', 'restaurant', rid))
        cur.execute("INSERT INTO restaurants (id, name, address, latitude, longitude, cuisine_type, owner_id, is_verified) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (rid, username + "'s Restaurant", '', 0, 0, 'Unknown', uid, False))

        conn.commit()
    return jsonify({ 'ok': True })

@app.post('/api/auth/login')
def login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT * FROM users WHERE email=%s LIMIT 1", (email,))
        user = cur.fetchone()
        if not user or not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
            return ('Invalid credentials', 401)
        token = generate_token(user['id'])
        return jsonify({ 'token': token })

@app.get('/api/users/me')
def me():
    au = authed_user()
    if not au: return ('Unauthorized', 401)
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id, username, email, profile_picture_url, bio, loyalty_points, level, user_type, restaurant_id FROM users WHERE id=%s", (au['uid'],))
        user = cur.fetchone()
        return jsonify(user)

@app.post('/api/users/<user_id>/follow')
def follow(user_id):
    au = authed_user()
    if not au: return ('Unauthorized', 401)
    with db() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO followers (follower_id, following_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (au['uid'], user_id))
        conn.commit()
    return jsonify({ 'ok': True })

@app.get('/api/restaurants/nearby')
def nearby():
    au = authed_user()  # optional
    lat = float(request.args.get('lat', '0'))
    lon = float(request.args.get('lon', '0'))
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id, name, address, latitude, longitude, cuisine_type, is_verified FROM restaurants ORDER BY created_at DESC LIMIT 100")
        rows = cur.fetchall() or []
        # distance filter can be added in SQL with earthdistance/cube ext; for simplicity return recent
        return jsonify(rows)

@app.get('/api/restaurants/<rid>')
def restaurant(rid):
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id, name, address, latitude, longitude, cuisine_type, is_verified FROM restaurants WHERE id=%s", (rid,))
        rest = cur.fetchone()
        if not rest: return ('Not found', 404)
        cur.execute("""
            SELECT r.id, r.user_id, r.restaurant_id, r.rating, r.review_text, r.created_at,
                   u.username, u.profile_picture_url
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            WHERE r.restaurant_id=%s
            ORDER BY r.created_at DESC
        """, (rid,))
        reviews = cur.fetchall() or []
        # photos
        for rv in reviews:
            cur.execute("SELECT photo_url FROM review_photos WHERE review_id=%s", (rv['id'],))
            rv['photos'] = [x[0] for x in cur.fetchall()] if cur.rowcount else []
            rv['user'] = { 'username': rv.pop('username', None), 'profilePictureUrl': rv.pop('profile_picture_url', None) }
        rest['reviews'] = reviews
        return jsonify(rest)

@app.post('/api/restaurants/<rid>/reviews')
def create_review(rid):
    au = authed_user()
    if not au: return ('Unauthorized', 401)
    data = request.get_json()
    rating = int(data.get('rating', 0))
    review_text = data.get('reviewText','')
    is_promoter = bool(data.get('isPromoter', False))
    photo_urls = data.get('photoUrls') or []
    if rating < 1 or rating > 5: return ('Invalid rating', 400)
    review_id = secrets.token_hex(8)
    created = datetime.utcnow()
    with db() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO reviews (id, user_id, restaurant_id, rating, review_text, created_at) VALUES (%s,%s,%s,%s,%s,%s)",
                    (review_id, au['uid'], rid, rating, review_text, created))
        for url in photo_urls:
            cur.execute("INSERT INTO review_photos (id, review_id, photo_url) VALUES (%s,%s,%s)", (secrets.token_hex(8), review_id, url))
        if is_promoter:
            cur.execute("INSERT INTO promotions (id, restaurant_id, created_by_user_id, is_active) VALUES (%s,%s,%s,%s)",
                        (review_id, rid, au['uid'], False))
        conn.commit()
    return jsonify({ 'id': review_id, 'ok': True })

@app.get('/api/reviews/recent')
def recent_reviews():
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("""
          SELECT r.id, r.user_id, r.restaurant_id, r.rating, r.review_text, r.created_at,
                 u.username, u.profile_picture_url, s.name as restaurant_name, s.cuisine_type
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          JOIN restaurants s ON s.id = r.restaurant_id
          ORDER BY r.created_at DESC
          LIMIT 20
        """)
        rows = cur.fetchall() or []
        for rv in rows:
            cur.execute("SELECT photo_url FROM review_photos WHERE review_id=%s", (rv['id'],))
            rv['photos'] = [x[0] for x in cur.fetchall()] if cur.rowcount else []
            rv['user'] = { 'username': rv.pop('username', None), 'profilePictureUrl': rv.pop('profile_picture_url', None), 'level': 'Bronze' }
            rv['restaurant'] = { 'name': rv.pop('restaurant_name', None), 'cuisineType': rv.pop('cuisine_type', None) }
        return jsonify(rows)

@app.post('/api/promotions/approve/<review_id>')
def approve_promotion(review_id):
    au = authed_user()
    if not au: return ('Unauthorized', 401)
    data = request.get_json()
    offer_id = data.get('offerId')
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # Ensure the authed user owns the restaurant linked to the promo request
        cur.execute("SELECT p.restaurant_id, p.created_by_user_id, s.owner_id FROM promotions p JOIN restaurants s ON s.id=p.restaurant_id WHERE p.id=%s", (review_id,))
        row = cur.fetchone()
        if not row or row['owner_id'] != au['uid']: return ('Forbidden', 403)
        payload = {
            "promoId": secrets.token_hex(8),
            "restaurantId": row['restaurant_id'],
            "promoterId": row['created_by_user_id'],
            "offerId": offer_id,
            "issuedAt": int(datetime.utcnow().timestamp())
        }
        encrypted = encrypt_code(row['restaurant_id'], payload)
        cur.execute("UPDATE promotions SET is_active=%s, encrypted_code=%s, offer_id=%s WHERE id=%s", (True, encrypted, offer_id, review_id))
        conn.commit()
        return jsonify({ 'encryptedCode': encrypted })

@app.post('/api/promotions/redeem')
def redeem():
    au = authed_user()
    if not au: return ('Unauthorized', 401)
    data = request.get_json()
    code = data.get('encryptedCode')
    if not code: return ('Missing encryptedCode', 400)
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # We need the restaurant id to decrypt; derive from promotions by scanning encrypted_code
        cur.execute("SELECT id, restaurant_id FROM promotions WHERE encrypted_code=%s AND is_active=true LIMIT 1", (code,))
        promo = cur.fetchone()
        if not promo: return ('Invalid code', 400)
        payload = decrypt_code(promo['restaurant_id'], code)
        promo_id = payload['promoId']
        promoter_id = payload['promoterId']
        # Prevent reuse by this follower
        cur.execute("SELECT 1 FROM redemptions WHERE promotion_id=%s AND redeemed_by_user_id=%s LIMIT 1", (promo['id'], au['uid']))
        if cur.fetchone(): return ('This promo code has already been used by you.', 400)
        # Record redemption
        cur.execute("INSERT INTO redemptions (id, promotion_id, redeemed_by_user_id, restaurant_id, redeemed_at) VALUES (%s,%s,%s,%s,%s)",
                    (secrets.token_hex(8), promo['id'], au['uid'], promo['restaurant_id'], datetime.utcnow()))
        # Award points to promoter
        cur.execute("UPDATE users SET loyalty_points = loyalty_points + 10 WHERE id=%s", (promoter_id,))
        conn.commit()
        return jsonify({ 'ok': True })
        
if __name__ == '__main__':
    assert DATABASE_URL, "Set DATABASE_URL env var to your Postgres connection string"
    app.run(host='0.0.0.0', port=5000)

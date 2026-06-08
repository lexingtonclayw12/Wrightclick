/* Social Media API — Facebook, Instagram, TikTok posting */
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

function getConfig(db, key) {
  const row = db.prepare('SELECT value FROM config WHERE key=?').get(key);
  return row ? row.value : process.env[key] || null;
}

/* ──────────────────────────────────────────
   FACEBOOK — publish text post to page
────────────────────────────────────────── */
async function publishFacebook(db, text) {
  const token = getConfig(db, 'META_PAGE_ACCESS_TOKEN') || process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = getConfig(db, 'META_PAGE_ID') || process.env.META_PAGE_ID;
  const apiVer = process.env.META_API_VERSION || 'v18.0';

  if (!token || !pageId) throw new Error('Meta credentials not configured. Set up in API Settings.');

  const url = `https://graph.facebook.com/${apiVer}/${pageId}/feed`;
  const res = await axios.post(url, { message: text, access_token: token });
  return { id: res.data.id, platform: 'facebook' };
}

/* ──────────────────────────────────────────
   INSTAGRAM — publish image + caption
   Note: IG API requires a media URL (image must be hosted publicly)
────────────────────────────────────────── */
async function publishInstagram(db, caption, imageUrl) {
  const token = getConfig(db, 'META_PAGE_ACCESS_TOKEN') || process.env.META_PAGE_ACCESS_TOKEN;
  const igUserId = getConfig(db, 'META_IG_USER_ID') || process.env.META_IG_USER_ID;
  const apiVer = process.env.META_API_VERSION || 'v18.0';

  if (!token || !igUserId) throw new Error('Instagram credentials not configured. Set up in API Settings.');
  if (!imageUrl) throw new Error('Instagram requires an image URL. Host an image and provide the public URL.');

  // Step 1: Create media container
  const createRes = await axios.post(`https://graph.facebook.com/${apiVer}/${igUserId}/media`, {
    image_url: imageUrl,
    caption: caption,
    access_token: token
  });
  const containerId = createRes.data.id;

  // Step 2: Publish container
  const publishRes = await axios.post(`https://graph.facebook.com/${apiVer}/${igUserId}/media_publish`, {
    creation_id: containerId,
    access_token: token
  });
  return { id: publishRes.data.id, platform: 'instagram' };
}

/* ──────────────────────────────────────────
   TIKTOK — initiate video upload + publish
   Video must be a file path on the server
────────────────────────────────────────── */
async function publishTikTok(db, caption, videoFilePath) {
  const accessToken = getConfig(db, 'TIKTOK_ACCESS_TOKEN') || process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken) throw new Error('TikTok access token not configured. Set up in API Settings.');
  if (!videoFilePath || !fs.existsSync(videoFilePath)) throw new Error('TikTok requires a video file. Upload a video first.');

  const stat = fs.statSync(videoFilePath);

  // Step 1: Initialize upload
  const initRes = await axios.post('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    post_info: {
      title: caption.substring(0, 150),
      privacy_level: 'PUBLIC_TO_EVERYONE',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: stat.size,
      chunk_size: stat.size,
      total_chunk_count: 1
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    }
  });

  const { publish_id, upload_url } = initRes.data.data;

  // Step 2: Upload video chunk
  const videoBuffer = fs.readFileSync(videoFilePath);
  await axios.put(upload_url, videoBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes 0-${stat.size - 1}/${stat.size}`,
      'Content-Length': stat.size
    }
  });

  // Step 3: Poll for status
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const statusRes = await axios.post('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      publish_id
    }, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' }
    });
    const { status } = statusRes.data.data;
    if (status === 'PUBLISH_COMPLETE') return { id: publish_id, platform: 'tiktok' };
    if (status === 'FAILED') throw new Error('TikTok publish failed after upload');
  }
  return { id: publish_id, platform: 'tiktok', status: 'processing' };
}

/* ──────────────────────────────────────────
   SHARED PUBLISH FUNCTION (used by scheduler)
────────────────────────────────────────── */
async function publishPost(db, platform, text, hashtags, mediaUrl) {
  const fullText = hashtags ? `${text}\n\n${hashtags}` : text;
  switch (platform) {
    case 'facebook': return publishFacebook(db, fullText);
    case 'instagram': return publishInstagram(db, fullText, mediaUrl);
    case 'tiktok': return publishTikTok(db, text, mediaUrl);
    default: throw new Error(`Unknown platform: ${platform}`);
  }
}

/* ──────────────────────────────────────────
   ROUTES
────────────────────────────────────────── */

// POST /api/posts/publish — publish immediately
router.post('/publish', async (req, res) => {
  const db = req.app.locals.db;
  const { platform, text, hashtags, media_url } = req.body;

  if (!platform || !text) return res.status(400).json({ error: 'platform and text are required' });

  try {
    const result = await publishPost(db, platform, text, hashtags, media_url);
    db.prepare(`
      INSERT INTO scheduled_posts (platform, content, hashtags, media_url, status, published_id, scheduled_for)
      VALUES (?, ?, ?, ?, 'published', ?, CURRENT_TIMESTAMP)
    `).run(platform, text, hashtags || '', media_url || '', result.id);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/schedule — schedule for later
router.post('/schedule', (req, res) => {
  const db = req.app.locals.db;
  const { platform, text, hashtags, media_url, scheduled_for } = req.body;

  if (!platform || !text || !scheduled_for) {
    return res.status(400).json({ error: 'platform, text, and scheduled_for are required' });
  }

  const result = db.prepare(`
    INSERT INTO scheduled_posts (platform, content, hashtags, media_url, scheduled_for)
    VALUES (?, ?, ?, ?, ?)
  `).run(platform, text, hashtags || '', media_url || '', scheduled_for);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Post scheduled' });
});

// GET /api/posts/calendar — list all scheduled posts
router.get('/calendar', (req, res) => {
  const db = req.app.locals.db;
  const posts = db.prepare('SELECT * FROM scheduled_posts ORDER BY scheduled_for ASC').all();
  res.json(posts);
});

// DELETE /api/posts/:id — cancel scheduled post
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM scheduled_posts WHERE id=? AND status=?').run(req.params.id, 'pending');
  res.json({ ok: true });
});

// POST /api/posts/upload-video — upload video file for TikTok
router.post('/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
  res.json({ path: req.file.path, filename: req.file.originalname });
});

module.exports = router;
module.exports.publishPost = publishPost;

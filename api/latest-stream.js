// api/latest-stream.js
import fs from 'fs';
import path from 'path';
import https from 'node:https';
import zlib from 'node:zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STREAM_FILE = path.join(DATA_DIR, 'stream.json');

const FACEBOOK_PROFILE = 'debby.kutu1';
const FACEBOOK_VIDEOS_URL = `https://www.facebook.com/${FACEBOOK_PROFILE}/videos`;

const DEFAULT_STREAM = {
    id: '2095379674433512',
    url: `https://web.facebook.com/${FACEBOOK_PROFILE}/videos/2095379674433512/`,
    canonicalUrl: `https://www.facebook.com/${FACEBOOK_PROFILE}/videos/2095379674433512/`,
    embedUrl: buildEmbedUrl(`https://web.facebook.com/${FACEBOOK_PROFILE}/videos/2095379674433512/`),
    title: "PREVAILERS CHAPEL INTERNATIONAL . JOIN US FOR A LIFE TRANSFORMING SERVICE WITH GOD'S SERVANT APOSTLE FRANK E K DZESE",
    publishTime: 1794733749,
    publishedAt: '2026-11-15T08:42:29.000Z',
    isLive: false,
    orientation: 'portrait',
    width: 432,
    height: 768,
    lastCheckedAt: new Date().toISOString()
};

let memoryCache = null;
let lastFetchTimestamp = 0;
let inFlightPromise = null;
let schedulerStarted = false;

function buildWatchUrl(videoId) {
    return `https://web.facebook.com/${FACEBOOK_PROFILE}/videos/${videoId}/`;
}

function buildEmbedUrl(videoUrl) {
    const encoded = encodeURIComponent(videoUrl);
    return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&t=0&allowfullscreen=true`;
}

function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    } catch (_) {}
}

function readStoredStream() {
    try {
        if (fs.existsSync(STREAM_FILE)) {
            const raw = fs.readFileSync(STREAM_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id) {
                return {
                    ...DEFAULT_STREAM,
                    ...parsed,
                    url: parsed.url || buildWatchUrl(parsed.id),
                    embedUrl: buildEmbedUrl(parsed.url || buildWatchUrl(parsed.id))
                };
            }
        }
    } catch (_) {}
    return { ...DEFAULT_STREAM };
}

function writeStoredStream(streamData) {
    try {
        ensureDataDir();
        fs.writeFileSync(STREAM_FILE, JSON.stringify(streamData, null, 2), 'utf-8');
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Safely extracts a balanced JSON object starting at the `{` at startIndex.
 */
function extractBalancedJsonObject(text, startIndex) {
    if (!text || startIndex < 0 || text[startIndex] !== '{') return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = startIndex; i < text.length; i++) {
        const ch = text[i];

        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\') {
            if (inString) escaped = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (ch === '{') {
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0) {
                const slice = text.slice(startIndex, i + 1);
                try {
                    return JSON.parse(slice);
                } catch (_) {
                    return null;
                }
            }
        }
    }
    return null;
}

function normalizeFacebookVideoNode(node) {
    if (!node || !node.id) return null;

    const id = String(node.id).trim();
    if (!/^\d{10,22}$/.test(id)) return null;

    const watchUrl = buildWatchUrl(id);
    const canonicalUrl = node.canonical_uri_with_fallback || watchUrl;
    const isLive = Boolean(node.video_thumbnail_overlays_renderer?.video?.is_live_streaming);

    const attachmentTarget = node.creation_story?.attachments?.[0]?.target || {};
    const width = Number(attachmentTarget.width) || null;
    const height = Number(attachmentTarget.height) || null;
    const orientation = width && height && width > height ? 'landscape' : 'portrait';

    const title =
        node.savable_title?.text ||
        node.creation_story?.message?.text ||
        "Life Transforming Service with God's Servant Apostle Frank E. K. Dzese";

    const publishTime = Number(node.publish_time) || 0;
    const publishedAt = publishTime > 0 ? new Date(publishTime * 1000).toISOString() : null;

    return {
        id,
        url: watchUrl,
        canonicalUrl,
        embedUrl: buildEmbedUrl(watchUrl),
        title,
        publishTime,
        publishedAt,
        isLive,
        orientation,
        width,
        height
    };
}

function parseVideosFromHtml(html) {
    if (!html || typeof html !== 'string') return [];

    const candidates = [];
    const seenIds = new Set();

    // Primary strategy: parse Relay GraphQL JSON containers ("latest_videos" and "all_videos")
    for (const marker of ['"latest_videos":', '"all_videos":']) {
        let searchFrom = 0;
        while (true) {
            const markerIdx = html.indexOf(marker, searchFrom);
            if (markerIdx === -1) break;

            const objStart = html.indexOf('{', markerIdx + marker.length);
            if (objStart !== -1) {
                const parsed = extractBalancedJsonObject(html, objStart);
                if (parsed && Array.isArray(parsed.edges)) {
                    for (const edge of parsed.edges) {
                        const normalized = normalizeFacebookVideoNode(edge?.node);
                        if (normalized && !seenIds.has(normalized.id)) {
                            seenIds.add(normalized.id);
                            candidates.push(normalized);
                        }
                    }
                }
            }
            searchFrom = markerIdx + marker.length;
        }
    }

    // Fallback strategy: scan for canonical debby.kutu1 video links in HTML
    if (candidates.length === 0) {
        const regex = new RegExp(`${FACEBOOK_PROFILE}\\\\/videos\\\\/(?:[^"\\\\/]+\\\\/)?(\\d{12,20})`, 'g');
        let match;
        while ((match = regex.exec(html)) !== null) {
            const id = match[1];
            if (!seenIds.has(id)) {
                seenIds.add(id);
                const watchUrl = buildWatchUrl(id);
                candidates.push({
                    id,
                    url: watchUrl,
                    canonicalUrl: watchUrl,
                    embedUrl: buildEmbedUrl(watchUrl),
                    title: "Life Transforming Service with God's Servant Apostle Frank E. K. Dzese",
                    publishTime: 0,
                    publishedAt: null,
                    isLive: false,
                    orientation: 'portrait',
                    width: null,
                    height: null
                });
            }
        }
    }

    return candidates;
}

function pickBestStream(candidates, previous) {
    if (!candidates || candidates.length === 0) return null;

    // 1. Always prefer a currently active live stream
    const liveStream = candidates.find(v => v.isLive);
    if (liveStream) return liveStream;

    // 2. Otherwise pick the most recently published video
    const sorted = [...candidates].sort((a, b) => (b.publishTime || 0) - (a.publishTime || 0));
    const newest = sorted[0];

    // If publishTime wasn't available, preserve order from latest_videos
    if (!newest.publishTime && candidates[0]) {
        return candidates[0];
    }

    // Never regress to an older video if previous has a strictly newer publishTime
    if (previous && previous.publishTime && newest.publishTime && newest.publishTime < previous.publishTime) {
        return previous;
    }

    return newest;
}

function fetchHtmlWithHttps(targetUrl, redirectsRemaining = 3) {
    return new Promise((resolve, reject) => {
        const req = https.get(
            targetUrl,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Sec-Fetch-Mode': 'navigate'
                }
            },
            (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsRemaining > 0) {
                    const nextUrl = new URL(res.headers.location, targetUrl).toString();
                    res.resume();
                    return resolve(fetchHtmlWithHttps(nextUrl, redirectsRemaining - 1));
                }

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    res.resume();
                    return reject(new Error(`Facebook returned HTTP ${res.statusCode}`));
                }

                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const encoding = (res.headers['content-encoding'] || '').toLowerCase();

                    const finish = (err, decoded) => {
                        if (err) return reject(err);
                        resolve(decoded.toString('utf-8'));
                    };

                    if (encoding === 'gzip') {
                        zlib.gunzip(buffer, finish);
                    } else if (encoding === 'deflate') {
                        zlib.inflate(buffer, finish);
                    } else if (encoding === 'br') {
                        zlib.brotliDecompress(buffer, finish);
                    } else {
                        resolve(buffer.toString('utf-8'));
                    }
                });
            }
        );

        req.setTimeout(12000, () => {
            req.destroy(new Error('Request timed out'));
        });
        req.on('error', reject);
    });
}

async function fetchFacebookVideosPage() {
    const html = await fetchHtmlWithHttps(FACEBOOK_VIDEOS_URL);
    const videos = parseVideosFromHtml(html);
    if (videos.length > 0) {
        return videos;
    }

    // Fallback to main profile page if /videos returned no video entries
    const profileHtml = await fetchHtmlWithHttps(`https://www.facebook.com/${FACEBOOK_PROFILE}`);
    return parseVideosFromHtml(profileHtml);
}

function getSmartCacheTtlMs() {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 = Sunday
    const utcHour = now.getUTCHours();

    if (utcDay === 0) {
        // Sunday service broadcast window (7:00 AM - 3:00 PM GMT)
        if (utcHour >= 7 && utcHour < 15) {
            return 60 * 1000; // 1 minute
        }
        return 5 * 60 * 1000; // 5 minutes on the rest of Sunday
    }

    return 30 * 60 * 1000; // 30 minutes Monday-Saturday
}

export async function getLatestStream({ forceRefresh = false } = {}) {
    const stored = memoryCache || readStoredStream();
    const now = Date.now();
    const ttl = getSmartCacheTtlMs();

    if (!forceRefresh && memoryCache && now - lastFetchTimestamp < ttl) {
        return memoryCache;
    }

    if (inFlightPromise) {
        return inFlightPromise;
    }

    inFlightPromise = (async () => {
        try {
            const candidates = await fetchFacebookVideosPage();
            const best = pickBestStream(candidates, stored);
            const checkedAt = new Date().toISOString();

            if (best) {
                const updated = {
                    ...best,
                    lastCheckedAt: checkedAt
                };
                memoryCache = updated;
                lastFetchTimestamp = Date.now();
                writeStoredStream(updated);

                if (stored.id !== updated.id) {
                    console.log(`[Stream Auto-Updater] Switched to newer Facebook video: ${updated.id} (live=${updated.isLive})`);
                }
                return updated;
            }
        } catch (err) {
            console.warn('[Stream Auto-Updater] Could not refresh from Facebook, using stored stream:', err.message);
        }

        const fallback = {
            ...stored,
            lastCheckedAt: stored.lastCheckedAt || new Date().toISOString()
        };
        memoryCache = fallback;
        lastFetchTimestamp = Date.now();
        return fallback;
    })();

    try {
        return await inFlightPromise;
    } finally {
        inFlightPromise = null;
    }
}

export function startSundayStreamScheduler() {
    if (schedulerStarted) return;
    schedulerStarted = true;

    // Initial non-blocking sync shortly after boot
    setTimeout(() => {
        getLatestStream({ forceRefresh: true }).catch(() => {});
    }, 1500);

    // Periodic check: every 2 minutes, refreshes according to Sunday / weekday schedule
    setInterval(() => {
        const now = new Date();
        const isSunday = now.getUTCDay() === 0;
        const utcHour = now.getUTCHours();
        const inSundayServiceWindow = isSunday && utcHour >= 7 && utcHour < 15;
        const ageMs = Date.now() - lastFetchTimestamp;

        if (inSundayServiceWindow && ageMs >= 90 * 1000) {
            getLatestStream({ forceRefresh: true }).catch(() => {});
        } else if (isSunday && ageMs >= 15 * 60 * 1000) {
            getLatestStream({ forceRefresh: true }).catch(() => {});
        } else if (!isSunday && ageMs >= 6 * 60 * 60 * 1000) {
            getLatestStream({ forceRefresh: true }).catch(() => {});
        }
    }, 2 * 60 * 1000);
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const forceRefresh = req.method === 'POST' || req.query?.refresh === '1' || req.query?.refresh === 'true';

    try {
        const stream = await getLatestStream({ forceRefresh });
        return res.status(200).json(stream);
    } catch (err) {
        console.error('[Stream Auto-Updater] Handler error:', err);
        const fallback = readStoredStream();
        return res.status(200).json(fallback);
    }
}

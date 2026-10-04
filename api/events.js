// api/events.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'events.json');
const DELETED_FILE = path.join(DATA_DIR, 'deleted_events.json');

const DEFAULT_EVENTS = [
    {
        id: "evt_1727100001",
        title: "Night of Prevailing Wonders & Prophetic Encounter",
        date: "2026-10-16",
        time: "6:30 PM - 9:30 PM",
        location: "PCI Main Auditorium, Prevailers Chapel",
        category: "Prayer & Revival",
        bannerImage: "4.jpeg",
        description: "Join us for an extraordinary evening of deep worship, fervent prayer, prophetic ministry, and supernatural breakthrough. Come expecting God to transform situations and release fresh grace for the season ahead.",
        createdAt: "2026-09-23T12:00:00.000Z"
    },
    {
        id: "evt_1727100002",
        title: "Annual Thanksgiving & Harvest Celebration",
        date: "2026-11-22",
        time: "9:00 AM - 1:00 PM",
        location: "PCI Main Sanctuary & Grounds",
        category: "Celebration",
        bannerImage: "5.jpeg",
        description: "A joyous gathering of our entire church family as we return all praise, glory, and honor to God for His faithfulness throughout the year. Featuring special choral presentations, family thanksgiving, and fellowship banquet.",
        createdAt: "2026-09-23T12:30:00.000Z"
    }
];

function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    } catch (err) {
        console.error('Error creating data directory:', err);
    }
}

function readDeletedEventIds() {
    try {
        ensureDataDir();
        if (!fs.existsSync(DELETED_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DELETED_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (err) {
        console.error('Error reading deleted_events file:', err);
        return [];
    }
}

function recordDeletedEventId(id) {
    if (!id) return;
    try {
        ensureDataDir();
        const deleted = readDeletedEventIds();
        const strId = String(id);
        if (!deleted.includes(strId)) {
            deleted.push(strId);
            fs.writeFileSync(DELETED_FILE, JSON.stringify(deleted, null, 2), 'utf-8');
        }
    } catch (err) {
        console.error('Error recording deleted event ID:', err);
    }
}

function removeDeletedEventId(id) {
    if (!id) return;
    try {
        ensureDataDir();
        const deleted = readDeletedEventIds();
        const strId = String(id);
        const filtered = deleted.filter(d => d !== strId);
        fs.writeFileSync(DELETED_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error removing deleted event ID:', err);
    }
}

function readEvents() {
    const deletedIds = new Set(readDeletedEventIds());
    try {
        ensureDataDir();
        if (!fs.existsSync(DATA_FILE)) {
            const initial = DEFAULT_EVENTS.filter(e => !deletedIds.has(String(e.id)));
            fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
            return initial;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        const list = Array.isArray(parsed) ? parsed : [];
        return list.filter(e => e && e.id && !deletedIds.has(String(e.id)));
    } catch (err) {
        console.error('Error reading events file:', err);
        return DEFAULT_EVENTS.filter(e => !deletedIds.has(String(e.id)));
    }
}

function writeEvents(events) {
    try {
        ensureDataDir();
        const deletedIds = new Set(readDeletedEventIds());
        const filtered = (Array.isArray(events) ? events : []).filter(e => e && e.id && !deletedIds.has(String(e.id)));
        fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error('Error writing events file:', err);
        return false;
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');

    // Never cache events endpoints across client or intermediaries
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET /api/events -> Returns all active events
    if (req.method === 'GET') {
        const events = readEvents();
        // Sort chronologically by date
        events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        return res.status(200).json(events);
    }

    // DELETE /api/events or POST with { action: 'delete' }
    const isDelete = req.method === 'DELETE' || (req.method === 'POST' && req.body && req.body.action === 'delete');
    if (isDelete) {
        try {
            const id = req.query?.id || req.body?.id || req.params?.id;
            if (!id) {
                return res.status(400).json({ error: 'Event ID is required to delete.' });
            }

            const strId = String(id);
            recordDeletedEventId(strId);

            const events = readEvents();
            const updated = events.filter(e => String(e.id) !== strId);
            writeEvents(updated);

            return res.status(200).json({
                success: true,
                message: 'Event removed successfully!',
                removedId: strId
            });
        } catch (err) {
            console.error('Error deleting event:', err);
            return res.status(500).json({ error: 'Failed to delete event.' });
        }
    }

    // POST /api/events -> Create new event
    if (req.method === 'POST') {
        try {
            const {
                title,
                date,
                time,
                location,
                description,
                category = 'Special Service',
                bannerImage = '4.jpeg'
            } = req.body || {};

            if (!title || !title.trim()) {
                return res.status(400).json({ error: 'Event title is required.' });
            }
            if (!date || !date.trim()) {
                return res.status(400).json({ error: 'Event date is required.' });
            }
            if (!time || !time.trim()) {
                return res.status(400).json({ error: 'Event time is required.' });
            }
            if (!location || !location.trim()) {
                return res.status(400).json({ error: 'Event location is required.' });
            }

            const newId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const newEvent = {
                id: newId,
                title: title.trim(),
                date: date.trim(),
                time: time.trim(),
                location: location.trim(),
                description: (description || '').trim() || 'Join us for this inspiring church program at Prevailers Chapel International.',
                category: (category || 'Special Service').trim(),
                bannerImage: (bannerImage || '4.jpeg').trim(),
                createdAt: new Date().toISOString()
            };

            // Ensure not in deleted list
            removeDeletedEventId(newId);

            const events = readEvents();
            events.push(newEvent);
            writeEvents(events);

            return res.status(201).json({
                success: true,
                message: 'Event added successfully!',
                event: newEvent
            });
        } catch (err) {
            console.error('Error creating event:', err);
            return res.status(500).json({ error: 'Failed to create event.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

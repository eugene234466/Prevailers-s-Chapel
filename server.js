import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dailyVerseHandler from './api/daily-verse.js';
import testHandler from './api/test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel insights script stub (prevents 404 console errors)
app.get('/_vercel/insights/script.js', (req, res) => {
    res.type('application/javascript').send('/* vercel insights disabled */');
});

// API routes
app.all('/api/daily-verse', async (req, res) => {
    try {
        await dailyVerseHandler(req, res);
    } catch (err) {
        console.error('Error handling /api/daily-verse:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.all('/api/test', async (req, res) => {
    try {
        await testHandler(req, res);
    } catch (err) {
        console.error('Error handling /api/test:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Static assets
app.use(express.static(__dirname));

// Route aliases without .html extension
const pages = ['home', 'devotional', 'events', 'services', 'contact', 'livestream'];
for (const page of pages) {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${page}.html`));
    });
}

// Fallback to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

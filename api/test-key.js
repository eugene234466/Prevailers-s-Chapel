// api/test-key.js
export default function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not found' });
  }
  res.status(200).json({ message: 'API key is set!', length: key.length });
}
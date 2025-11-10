import fetch from 'node-fetch';

export default async function handler(req, res) {
    const backend = process.env.VITE_BACKEND_URL;
    const url = `${backend}${req.url}`;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                ...req.headers,
                host: undefined,
            },
            body: req.method !== 'GET' ? req.body : undefined,
        });

        const data = await response.text();
        res.status(response.status).send(data);
    } catch (err) {
        res.status(500).json({ error: 'Proxy error', details: err.message });
    }
}

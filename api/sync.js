// api.js
import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  // Enable CORS for your app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Load progress from cloud
    if (req.method === 'GET') {
      const { blobs } = await list();
      
      // Find the progress file
      const progressBlob = blobs.find(blob => blob.pathname === 'ephi-progress.json');
      
      if (!progressBlob) {
        return res.status(200).json({ completedDays: [] });
      }
      
      const response = await fetch(progressBlob.url);
      const data = await response.json();
      
      return res.status(200).json(data);
    }

    // POST - Save progress to cloud
    if (req.method === 'POST') {
      const { completedDays } = req.body;
      
      const blob = await put('ephi-progress.json', JSON.stringify({ completedDays }), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });

      return res.status(200).json({ success: true, url: blob.url });
    }

    // DELETE - Clear cloud data
    if (req.method === 'DELETE') {
      const { blobs } = await list();
      
      for (const blob of blobs) {
        if (blob.pathname === 'ephi-progress.json') {
          await del(blob.url);
        }
      }
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }

}



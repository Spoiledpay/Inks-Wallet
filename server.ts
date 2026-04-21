import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Inks Node API URL (Default)
  let nodeApiUrl = process.env.INKS_NODE_URL || 'http://127.0.0.1:8545';
  let isNodeRunning = false;

  // Logs simulation
  const logs: string[] = [];
  const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const logMessages = [
    'Chain synchronized to block #12,405,192',
    'Peer 0x7a2... disconnected due to timeout',
    'New transaction received: 0x8a7...f2d',
    'Consensus reached for block #12,405,193',
    'Database compacting complete',
    'Mempool updated: 14 pending txs',
    'P2P discovery: 4 new peers found'
  ];

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    const type = logTypes[Math.floor(Math.random() * logTypes.length)];
    const log = `[${timestamp}] [${type}] ${msg}`;
    logs.push(log);
    if (logs.length > 100) logs.shift();
  };

  // Keep logs rotating if node "running"
  setInterval(() => {
    if (isNodeRunning) {
      addLog(logMessages[Math.floor(Math.random() * logMessages.length)]);
    }
  }, 2000);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      nodeRunning: isNodeRunning,
      config: { nodeApiUrl }
    });
  });

  // Get Node Logs
  app.get('/api/node/logs', (req, res) => {
    res.json({ logs });
  });

  // Update Node Config
  app.post('/api/node/config', (req, res) => {
    const { url } = req.body;
    if (url) {
      nodeApiUrl = url;
      console.log(`Node connection URL updated to: ${nodeApiUrl}`);
      res.json({ success: true, url: nodeApiUrl });
    } else {
      res.status(400).json({ error: 'URL is required' });
    }
  });

  // Proxy to Inks Node API or simulate
  app.post('/api/rpc', async (req, res) => {
    // In a real scenario, we'd fetch from nodeApiUrl
    // For now, we simulate basic responses if node is "off"
    const { method, params } = req.body;

    // Simulation logic for demo purposes
    if (!isNodeRunning && method !== 'node_info') {
      return res.status(503).json({ error: 'Node is currently offline. Please start the node to perform this action.' });
    }

    switch (method) {
      case 'node_info':
        res.json({
          status: isNodeRunning ? 'online' : 'offline',
          version: '1.2.0',
          chainId: 'inks-main-1',
          blockHeight: isNodeRunning ? 15420 : 0,
          peers: isNodeRunning ? 8 : 0
        });
        break;
      case 'wallet_balance':
        res.json({ balance: '1250.45', unit: 'INK', address: params?.[0] || '0x...' });
        break;
      case 'tx_send':
        res.json({ hash: '0x' + Math.random().toString(16).slice(2, 66), status: 'pending' });
        break;
      default:
        res.status(404).json({ error: 'Method not implemented in simulation' });
    }
  });

  // Node Management
  app.post('/api/node/start', (req, res) => {
    isNodeRunning = true;
    console.log('Inks Node started manually via UI');
    res.json({ success: true, message: 'Node starting...' });
  });

  app.post('/api/node/stop', (req, res) => {
    isNodeRunning = false;
    console.log('Inks Node stopped manually via UI');
    res.json({ success: true, message: 'Node stopped.' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

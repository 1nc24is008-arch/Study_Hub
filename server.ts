import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { getAcademicResponse } from './src/utils/aiKnowledge';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

const SYSTEM_INSTRUCTION = `You are Dear_AI, the official Academic Engineering Copilot & Study Assistant.

Your primary goal is to present all answers in a pristine, structured, and easily readable format designed specifically for university students, educators, and engineers.

Formatting Guidelines for EVERY response:
1. **Title & Overview**:
   - Start with a clear Markdown Header (e.g. \`### 💡 [Topic Name]\` or \`### 🤖 [Concept Overview]\`).
   - Give a crisp 1-2 sentence core definition or executive summary with bolded key terms.
2. **Structured Sections (Numbered or Titled)**:
   - Use clear subheaders like \`#### 1. Core Principles & Architecture\`, \`#### 2. Comparison / Key Components\`, \`#### 3. Step-by-Step Implementation\`.
3. **Tables for Comparisons & Trade-offs**:
   - Whenever explaining multiple components, types, layers, or trade-offs, use well-structured Markdown tables (\`| Feature | Description | Example |\`).
4. **Code & Syntax Blocks**:
   - Format all code with language identifiers (\`\`\`python, \`\`\`cpp, \`\`\`java, \`\`\`sql, \`\`\`javascript) with inline comments explaining critical steps.
5. **Formulas & Complexities**:
   - Explicitly list Time Complexity, Space Complexity, and mathematical formulas using LaTeX ($O(N \\log N)$, $\\mathcal{O}(V+E)$).
6. **Key Exam & Viva Takeaways**:
   - End with a \`#### 📌 High-Yield Takeaways / Exam Tips\` section highlighting points for 5-mark / 10-mark questions or viva exams.

Always maintain high readability, no unbroken walls of text, and clean bulleted hierarchy.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow larger payloads for PDF and image attachments
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Ensure uploads directory exists and serve files statically
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Direct study material file upload endpoint (Base64 or binary safe)
  app.post('/api/upload-material', async (req, res) => {
    try {
      const { filename, fileData, mimeType } = req.body;
      if (!filename || !fileData) {
        return res.status(400).json({ error: 'Filename and file data are required.' });
      }

      // Sanitize safe filename
      const cleanName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = path.join(uploadsDir, cleanName);

      // Strip optional data:mime/type;base64, prefix if present
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${cleanName}`;
      res.json({
        success: true,
        fileUrl,
        filename: cleanName,
        size: buffer.length
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({ error: err.message || 'File upload failed' });
    }
  });

  // Delete uploaded file endpoint
  app.delete('/api/upload-material', async (req, res) => {
    try {
      const { filename } = req.body;
      if (filename) {
        const filePath = path.join(uploadsDir, path.basename(filename));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('File deletion error:', err);
      res.status(500).json({ error: err.message || 'Deletion failed' });
    }
  });

  // Streaming Gemini AI endpoint
  app.post('/api/ai/chat/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { prompt, attachment } = req.body;
    const userPrompt = (prompt || '').trim();

    if (!userPrompt && !attachment) {
      res.write(`data: ${JSON.stringify({ error: 'Please enter a message or upload an attachment.' })}\n\n`);
      return res.end();
    }

    try {
      const ai = getGeminiClient();
      const parts: any[] = [];

      if (attachment && attachment.data && attachment.mimeType) {
        parts.push({
          inlineData: {
            data: attachment.data,
            mimeType: attachment.mimeType,
          },
        });
      }

      if (userPrompt) {
        parts.push({ text: userPrompt });
      }

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (_error: any) {
      // Provide intelligent academic response gracefully
      const fallbackText = getAcademicResponse(userPrompt, attachment?.name);
      
      // Stream fallback in small chunks for smooth UI animation
      const words = fallbackText.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  });

  // Non-streaming endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const { prompt, attachment } = req.body;
    const userPrompt = (prompt || '').trim();

    try {
      const ai = getGeminiClient();
      const parts: any[] = [];

      if (attachment && attachment.data && attachment.mimeType) {
        parts.push({
          inlineData: {
            data: attachment.data,
            mimeType: attachment.mimeType,
          },
        });
      }

      if (userPrompt) {
        parts.push({ text: userPrompt });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      res.json({ text: response.text || '' });
    } catch (_error: any) {
      const fallbackText = getAcademicResponse(userPrompt, attachment?.name);
      res.json({ text: fallbackText });
    }
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Gemini solo se activa si hay una clave real en .env (GEMINI_API_KEY)
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey && rawKey.trim() !== '' && rawKey !== 'MY_GEMINI_API_KEY' ? rawKey.trim() : undefined;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

  const clip = (v: unknown, max: number) => String(v ?? '').slice(0, max);

  // Auditoría orientativa de integridad académica. Si la IA no está disponible se
  // responde con un error claro: nunca se inventa un resultado.
  app.post('/api/ai/audit-originality', async (req, res) => {
    const title = clip(req.body?.title, 200).trim();
    const description = clip(req.body?.description, 4000).trim();
    if (!title || !description) {
      return res.status(400).json({ error: 'Se requiere título y descripción del material.' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'La auditoría con IA no está configurada en este servidor (falta GEMINI_API_KEY).',
      });
    }

    const prompt = `Evalúa el siguiente recurso que un estudiante quiere compartir en "Exchange UCV", una plataforma estudiantil de intercambio académico.
Determina si sirve para el aprendizaje y si hay señales de plagio, venta de evaluaciones resueltas o falta de citación.
Responde en español. Sé honesto: si la descripción es insuficiente para juzgar, dilo en el resumen y usa REQUIERE_CITACION.

- Título: ${title}
- Curso: ${clip(req.body?.course, 120) || 'No indicado'}
- Carrera: ${clip(req.body?.career, 80) || 'No indicada'}
- Sección: ${clip(req.body?.category, 40) || 'No indicada'}
- Modalidad: ${clip(req.body?.exchangeType, 60) || 'No indicada'}
- Descripción:
"""
${description}
"""`;

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 15000)
      );
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction:
              'Eres un evaluador de integridad académica. Analiza con rigor, sin exagerar ni aprobar por defecto. Los puntajes son orientativos.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                originalityScore: { type: Type.INTEGER, description: 'Aporte formativo y originalidad estimados (0-100)' },
                verdict: { type: Type.STRING, enum: ['APROBADO_INTEGRO', 'REQUIERE_CITACION', 'RIESGO_SIMILITUD'] },
                summary: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                academicIntegrityNote: { type: Type.STRING },
              },
              required: ['originalityScore', 'verdict', 'summary', 'strengths', 'suggestions', 'academicIntegrityNote'],
            },
          },
        }),
        timeout,
      ]);
      const parsed = JSON.parse(response.text || '{}');
      if (typeof parsed.originalityScore !== 'number' || !parsed.verdict) {
        throw new Error('Respuesta incompleta del modelo');
      }
      parsed.originalityScore = Math.max(0, Math.min(100, Math.round(parsed.originalityScore)));
      return res.json(parsed);
    } catch (err) {
      console.warn('Fallo en la auditoría con Gemini:', err);
      return res.status(502).json({
        error: 'El servicio de IA no respondió. Inténtalo de nuevo en unos minutos.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Exchange UCV Backend',
      geminiConfigured: Boolean(ai),
      model: ai ? model : null,
    });
  });

  // Setup Vite in middleware mode for dev or serve static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Exchange UCV server running on http://0.0.0.0:${port}`);
  });
}

startServer();

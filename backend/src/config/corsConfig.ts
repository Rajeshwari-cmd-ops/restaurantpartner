import { CorsOptions } from 'cors';

// Core allowed origins for local development and deployed production frontend
export const DEFAULT_ALLOWED_ORIGINS: string[] = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://fic-restaurant-frontend.onrender.com',
];

export const getAllowedOrigins = (): string[] => {
  const envOrigins = [process.env.CORS_ORIGIN, process.env.CLIENT_URL]
    .filter((val): val is string => Boolean(val && val.trim()))
    .flatMap(val => val.split(',').map(s => s.trim()))
    .filter(Boolean);

  const merged = Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]));
  return merged.map(origin => origin.replace(/\/+$/, ''));
};

export const isOriginAllowed = (requestOrigin: string | undefined): boolean => {
  if (!requestOrigin) return true; // Allow mobile clients, curl, server-to-server requests
  const normalized = requestOrigin.replace(/\/+$/, '');
  const allowed = getAllowedOrigins();
  return allowed.includes(normalized);
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} is not allowed by CORS configuration.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

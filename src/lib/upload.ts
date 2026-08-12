import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { UPLOADS_DIR, MAX_UPLOAD_SIZE_BYTES } from '@/lib/constants';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export class UploadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function saveUploadedPhoto(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError(400, 'Foto deve ser JPEG, PNG ou WebP.');
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new UploadError(400, `Foto excede o limite de ${MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB.`);
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/api/uploads/${filename}`;
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function readUploadedPhoto(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safeName = path.basename(filename);
  const ext = path.extname(safeName).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext];
  if (!contentType) return null;

  const filePath = path.join(UPLOADS_DIR, safeName);
  try {
    const buffer = await fs.readFile(filePath);
    return { buffer, contentType };
  } catch {
    return null;
  }
}

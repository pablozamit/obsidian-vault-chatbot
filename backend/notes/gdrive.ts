import { api } from "encore.dev/api";
import { UploadNotesResponse, ImportDriveRequest } from "./types";
import db from "../external_dbs/postgres/db";
import { google } from "googleapis";

function extractFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function fetchMarkdownFiles(folderId: string): Promise<{title: string; path: string; content: string;}[]> {
  const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/drive.readonly"] });
  const drive = google.drive({ version: "v3", auth });
  const files: {title: string; path: string; content: string;}[] = [];
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType)',
  });
  for (const file of res.data.files || []) {
    if (!file.name) continue;
    if (!file.name.endsWith('.md')) continue;
    if (!file.id) continue;
    const contentRes = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
    const content = Buffer.from(contentRes.data as any).toString('utf8');
    files.push({ title: file.name.replace(/\.md$/, ''), path: file.name, content });
  }
  return files;
}

// Imports markdown notes from a Google Drive folder URL and processes them.
export const importDrive = api<ImportDriveRequest, UploadNotesResponse>(
  { expose: true, method: 'POST', path: '/notes/import-drive' },
  async (req) => {
    const folderId = extractFolderId(req.folderUrl);
    if (!folderId) {
      return { processed: 0, errors: ['Invalid folder URL'] };
    }
    const errors: string[] = [];
    let processed = 0;
    const notes = await fetchMarkdownFiles(folderId).catch(err => { errors.push(String(err)); return []; });
    for (const note of notes) {
      try {
        await db.exec`
          INSERT INTO notes (title, path, content, updated_at)
          VALUES (${note.title}, ${note.path}, ${note.content}, NOW())
          ON CONFLICT (path)
          DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            updated_at = NOW()
        `;
        processed++;
      } catch (error) {
        const msg = `Failed to process note ${note.path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(msg);
      }
    }
    return { processed, errors };
  }
);

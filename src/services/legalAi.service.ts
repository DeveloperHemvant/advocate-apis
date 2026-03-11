import fetch from 'node-fetch';

interface GenerateDraftPayload {
  document_type: string;
  court_name?: string;
  client_name?: string;
  section?: string;
  case_facts: string;
  [key: string]: unknown;
}

function getLegalAiBaseUrl(): string {
  const raw = process.env.LEGAL_AI_API_URL || 'http://legal-ai:8000';
  return raw.replace(/\/$/, '');
}

export async function generateDraftViaLegalAi(payload: GenerateDraftPayload) {
  const base = getLegalAiBaseUrl();
  const url = `${base}/generate-draft`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const msg = data?.detail || data?.error || 'Legal AI service error';
    throw new Error(msg);
  }
  return data;
}


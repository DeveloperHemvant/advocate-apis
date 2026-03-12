type AnyJson = Record<string, unknown>;

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

async function postJson<T>(path: string, payload: AnyJson): Promise<T> {
  const base = getLegalAiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
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
  return data as T;
}

export async function generateDraftViaLegalAi(payload: GenerateDraftPayload) {
  return postJson('/generate-draft', payload as AnyJson);
}

export async function generateReasoningViaLegalAi(payload: AnyJson) {
  return postJson('/generate-reasoning', payload);
}

export async function generateArgumentsViaLegalAi(payload: AnyJson) {
  return postJson('/generate-arguments', payload);
}

export async function generateCitationsViaLegalAi(payload: AnyJson) {
  return postJson('/generate-citations', payload);
}


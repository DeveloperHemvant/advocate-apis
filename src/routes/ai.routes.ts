import { Router } from 'express';
import { generateDraftViaLegalAi } from '../services/legalAi.service';

export const aiRouter = Router();

aiRouter.post('/drafts', async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.document_type || !body.case_facts) {
      return res.status(400).json({ error: 'document_type and case_facts are required' });
    }
    const result = await generateDraftViaLegalAi({
      document_type: body.document_type,
      court_name: body.court_name,
      client_name: body.client_name,
      section: body.section,
      case_facts: body.case_facts,
      ...body.extra,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate draft' });
  }
});


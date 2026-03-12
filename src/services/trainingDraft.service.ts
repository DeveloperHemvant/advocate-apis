import { prisma } from '../utils/prisma';

export interface CreateTrainingDraftInput {
  userId: string | null;
  documentType: string;
  title?: string | null;
  facts?: string | null;
  draftText: string;
  courtType?: string | null;
  state?: string | null;
}

export async function createTrainingDraft(input: CreateTrainingDraftInput) {
  const now = new Date();
  return prisma.trainingDraft.create({
    data: {
      userId: input.userId ?? null,
      documentType: input.documentType,
      title: input.title ?? null,
      facts: input.facts ?? null,
      draftText: input.draftText,
      courtType: input.courtType ?? null,
      state: input.state ?? null,
      approvedAt: now,
      createdAt: now,
    },
  });
}

export interface ListTrainingDraftsParams {
  userId: string | null;
  limit?: number;
  offset?: number;
}

export async function listTrainingDrafts(params: ListTrainingDraftsParams) {
  const take = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  return prisma.trainingDraft.findMany({
    where: params.userId ? { userId: params.userId } : {},
    orderBy: { approvedAt: 'desc' },
    take,
    skip,
  });
}


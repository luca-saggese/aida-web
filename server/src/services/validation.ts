import { z } from 'zod';

const noulCriteria = z
  .object({ true: z.unknown().optional(), false: z.unknown().optional() })
  .optional();

const questionSchema = z.union([
  z.object({
    type: z.literal('noul'),
    instructions: z.unknown().optional(),
    criteria: noulCriteria,
  }),
  z.object({
    type: z.literal('choice'),
    instructions: z.unknown().optional(),
    criteria: z.record(z.string(), z.unknown()).refine(
      (val) => Object.keys(val).length > 0,
      { message: 'Choice must have at least one option' },
    ).refine(
      (val) => Object.keys(val).length <= 255,
      { message: 'Choice supports at most 255 options' },
    ),
  }),
  z.object({
    type: z.literal('score'),
    instructions: z.unknown().optional(),
    criteria: z
      .array(z.unknown())
      .min(2, { message: 'Score requires at least 2 levels' })
      .max(10, { message: 'Score supports at most 10 levels' }),
  }),
]);

export const systemOneRequestSchema = z.object({
  state: z.unknown().default({}),
  model: z.string().min(1).default('laya'),
  questions: z
    .record(z.string(), questionSchema)
    .refine((val) => Object.keys(val).length > 0, { message: 'At least one question is required' }),
});

export function assertSystemOneState(input: {
  state?: unknown;
  model: string;
  questions: Record<string, unknown>;
}): { state: unknown; model: string; questions: Record<string, unknown> } {
  return { state: input.state ?? {}, model: input.model, questions: input.questions };
}

export type SystemOneRequestInput = z.infer<typeof systemOneRequestSchema>;
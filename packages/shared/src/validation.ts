import { z } from "zod";

export const RoleSchema = z.enum(["ADMIN", "OPERATOR", "CLIENT"]);

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const RefreshDtoSchema = z.object({
  refreshToken: z.string().min(10)
});
export type RefreshDto = z.infer<typeof RefreshDtoSchema>;

export const CreateQueueDtoSchema = z.object({
  establishmentId: z.string().uuid(),
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(40),
  avgServiceTimeMin: z.number().int().min(1).max(240),
  isOpen: z.boolean().optional().default(true)
});
export type CreateQueueDto = z.infer<typeof CreateQueueDtoSchema>;

export const JoinQueueDtoSchema = z.object({
  clientName: z.string().min(2).max(80).optional()
});
export type JoinQueueDto = z.infer<typeof JoinQueueDtoSchema>;


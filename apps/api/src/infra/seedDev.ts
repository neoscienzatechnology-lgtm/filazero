import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

/**
 * Seed mínimo para facilitar o MVP local.
 * Credenciais:
 * - Admin: admin@fila.local / 123456
 * - Operador: operador@fila.local / 123456
 * - Cliente: cliente@fila.local / 123456
 */
export async function seedDev(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fila.local" },
    update: {},
    create: { email: "admin@fila.local", passwordHash, role: Role.ADMIN }
  });

  const establishment =
    (await prisma.establishment.findFirst({ where: { ownerId: admin.id } })) ??
    (await prisma.establishment.create({
      data: { name: "Clínica Exemplo", ownerId: admin.id }
    }));

  await prisma.user.upsert({
    where: { email: "operador@fila.local" },
    update: {},
    create: {
      email: "operador@fila.local",
      passwordHash,
      role: Role.OPERATOR,
      establishmentId: establishment.id
    }
  });

  await prisma.user.upsert({
    where: { email: "cliente@fila.local" },
    update: {},
    create: { email: "cliente@fila.local", passwordHash, role: Role.CLIENT }
  });

  const existingQueue = await prisma.queue.findFirst({
    where: { establishmentId: establishment.id }
  });

  if (!existingQueue) {
    await prisma.queue.create({
      data: {
        establishmentId: establishment.id,
        name: "Consultas",
        type: "Atendimento",
        avgServiceTimeMin: 10,
        isOpen: true,
        publicSlug: "consultas-exemplo"
      }
    });
  }
}


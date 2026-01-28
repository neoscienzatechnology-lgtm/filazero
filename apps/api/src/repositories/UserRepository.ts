import type { PrismaClient, User } from "@prisma/client";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createClientAnon(name?: string) {
    // MVP: clientes podem entrar anônimos sem criar User
    return { name: name?.trim() || null };
  }

  listByEstablishment(establishmentId: string) {
    return this.prisma.user.findMany({ where: { establishmentId } });
  }
}


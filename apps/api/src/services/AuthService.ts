import bcrypt from "bcryptjs";
import { BadRequestError, UnauthorizedError } from "../domain/errors";
import { AuthRepository } from "../repositories/AuthRepository";
import { UserRepository } from "../repositories/UserRepository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../infra/security/jwt";
import { hashToken } from "../infra/security/tokenHash";

export class AuthService {
  constructor(
    private users: UserRepository,
    private authRepo: AuthRepository
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedError("Credenciais inválidas");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedError("Credenciais inválidas");

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.authRepo.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await this.authRepo.findRefreshToken(hashToken(refreshToken));
    if (!stored) throw new UnauthorizedError("Refresh token inválido");
    if (stored.expiresAt.getTime() < Date.now()) throw new UnauthorizedError("Refresh token expirado");

    // rotação simples: revoga o atual e emite outro
    await this.authRepo.revokeRefreshToken(stored.id);

    const accessToken = signAccessToken({ sub: decoded.sub, role: decoded.role });
    const newRefreshToken = signRefreshToken({ sub: decoded.sub, role: decoded.role });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.authRepo.createRefreshToken({
      userId: decoded.sub,
      tokenHash: hashToken(newRefreshToken),
      expiresAt
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) throw new BadRequestError("refreshToken é obrigatório");
    const stored = await this.authRepo.findRefreshToken(hashToken(refreshToken));
    if (!stored) return { ok: true };
    await this.authRepo.revokeRefreshToken(stored.id);
    return { ok: true };
  }
}


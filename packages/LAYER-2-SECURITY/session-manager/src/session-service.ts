/**
 * @houselevi/security/session-manager/session-service
 * Session creation and management
 */

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  token: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  /**
   * Create a new session
   */
  createSession(userId: string, deviceId: string, token: string): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    const session: Session = {
      id: `session_${Date.now()}_${Math.random()}`,
      userId,
      deviceId,
      token,
      refreshToken: `refresh_${Date.now()}_${Math.random()}`,
      createdAt: now,
      expiresAt,
      isActive: true,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (new Date() > session.expiresAt) {
      session.isActive = false;
    }

    return session;
  }

  /**
   * Revoke a session
   */
  revokeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      return true;
    }
    return false;
  }

  /**
   * Revoke all sessions for a user
   */
  revokeUserSessions(userId: string): number {
    let count = 0;
    this.sessions.forEach((session) => {
      if (session.userId === userId) {
        session.isActive = false;
        count++;
      }
    });
    return count;
  }

  /**
   * Refresh a session token
   */
  refreshSession(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    if (!session || !session.isActive) return null;

    session.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    return `refresh_${Date.now()}_${Math.random()}`;
  }
}

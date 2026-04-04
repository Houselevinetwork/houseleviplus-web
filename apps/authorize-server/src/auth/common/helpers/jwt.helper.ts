import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  sub: string;
  email: string;
  scope: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  nonce?: string;
}

export class JWTHelper {
  private static SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
  private static ISSUER = process.env.AUTHORIZE_SERVER_URL || 'http://localhost:3002';

  /**
   * Create access token
   */
  static createAccessToken(
    userId: string,
    email: string,
    scope: string,
    clientId: string,
    expiresIn = '1h'
  ): string {
    const payload: JWTPayload = {
      sub: userId,
      email,
      scope,
      aud: clientId,
      iss: this.ISSUER,
      iat: Math.floor(Date.now() / 1000),
      exp: 0
    };

    return jwt.sign(payload, this.SECRET, {
      expiresIn,
      algorithm: 'HS256'
    });
  }

  /**
   * Create ID token (for OpenID Connect)
   */
  static createIDToken(
    userId: string,
    email: string,
    nonce: string,
    clientId: string
  ): string {
    const payload: JWTPayload = {
      sub: userId,
      email,
      scope: 'openid profile email',
      aud: clientId,
      iss: this.ISSUER,
      iat: Math.floor(Date.now() / 1000),
      exp: 0,
      nonce
    };

    return jwt.sign(payload, this.SECRET, {
      expiresIn: '1h',
      algorithm: 'HS256'
    });
  }

  /**
   * Create refresh token
   */
  static createRefreshToken(userId: string, clientId: string): string {
    return jwt.sign(
      {
        sub: userId,
        aud: clientId,
        iss: this.ISSUER,
        iat: Math.floor(Date.now() / 1000),
        type: 'refresh'
      },
      this.SECRET,
      {
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );
  }

  /**
   * Verify token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.SECRET, {
        algorithms: ['HS256']
      }) as JWTPayload;
    } catch (error) {
      throw new Error(\Invalid token: \\);
    }
  }
}

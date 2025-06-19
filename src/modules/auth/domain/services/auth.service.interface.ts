export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  generateToken(userData: any): Promise<string>;
  validateToken(token: string): Promise<any>;
}

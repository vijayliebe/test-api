// auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let bcryptCompare: jest.Mock;

  beforeEach(async () => {
    bcryptCompare = bcrypt.compare as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        get: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          password: 'hashedPassword',
        }),
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcryptCompare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockUser.get).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
    });

    it('should return null when password does not match', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(false);

      const result = await authService.validateUser('test@example.com', 'wrongPassword');

      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcryptCompare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent@example.com', 'password123');

      expect(usersService.findOne).toHaveBeenCalledWith('nonexistent@example.com');
      expect(bcryptCompare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle errors thrown by usersService.findOne', async () => {
      (usersService.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.validateUser('test@example.com', 'password123')).rejects.toThrow('Database error');
      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcryptCompare).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'mockAccessToken';

      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'test@example.com', sub: 1 });
      expect(result).toEqual({ access_token: mockToken });
    });
  });

  describe('logout', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log out user without errors', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      await expect(authService.logout(mockUser)).resolves.toBeUndefined();
      expect(consoleLogSpy).toHaveBeenCalledWith('Logging out user:', 'test@example.com');
    });
  });
});

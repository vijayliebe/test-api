import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConflictException, 
  BadRequestException, 
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
};

const mockUsersService = {
  create: jest.fn(),
};

export class MockJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 1, email: 'test@example.com' }; // Mocked user
    return true;
  }
}

describe('AuthController - Register', () => {
  let authController: AuthController;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    const body = { email: 'test@example.com', password: 'Password123' };
    const createdUser: any = { id: 1, ...body };
    jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

    const result = await authController.register(body);
    expect(usersService.create).toHaveBeenCalledWith(body);
    expect(result).toEqual(createdUser);
  });

  it('should throw BadRequestException if email is not provided', async () => {
    const body = { password: 'Password123' };

    await expect(authController.register(body)).rejects.toThrow(BadRequestException);
    await expect(authController.register(body)).rejects.toThrow('Email is required');
  });

  it('should throw BadRequestException if password is not provided', async () => {
    const body = { email: 'test@example.com' };

    await expect(authController.register(body)).rejects.toThrow(BadRequestException);
    await expect(authController.register(body)).rejects.toThrow('Password is required');
  });

  it('should throw BadRequestException if email format is invalid', async () => {
    const body = { email: 'invalid-email', password: 'Password123' };

    await expect(authController.register(body)).rejects.toThrow(BadRequestException);
    await expect(authController.register(body)).rejects.toThrow('Provide valid email');
  });

  it('should throw ConflictException if email already exists', async () => {
    const body = { email: 'test@example.com', password: 'Password123' };
    const error = new Error();
    error.name = 'SequelizeUniqueConstraintError';
    jest.spyOn(usersService, 'create').mockRejectedValue(error);

    await expect(authController.register(body)).rejects.toThrow(ConflictException);
    await expect(authController.register(body)).rejects.toThrow('Email already exists');
  });

  it('should throw InternalServerErrorException for other errors', async () => {
    const body = { email: 'test@example.com', password: 'Password123' };
    const error = new Error('Database error');
    jest.spyOn(usersService, 'create').mockRejectedValue(error);

    await expect(authController.register(body)).rejects.toThrow(InternalServerErrorException);
  });
});

describe('AuthController - Login', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const body = { email: 'test@example.com', password: 'Password123' };
    const user = { id: 1, email: 'test@example.com' };
    const token: any = { access_token: 'jwt-token' };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
    jest.spyOn(authService, 'login').mockReturnValue(token);

    const result = await authController.login(body);

    expect(authService.validateUser).toHaveBeenCalledWith(body.email, body.password);
    expect(authService.login).toHaveBeenCalledWith(user);
    expect(result).toEqual(token);
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    const body = { email: 'test@example.com', password: 'WrongPassword' };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(authController.login(body)).rejects.toThrow(UnauthorizedException);
    await expect(authController.login(body)).rejects.toThrow("This user doesn't exist");
    expect(authService.validateUser).toHaveBeenCalledWith(body.email, body.password);
    expect(authService.login).not.toHaveBeenCalled();
  });
});


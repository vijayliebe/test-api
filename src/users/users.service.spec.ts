import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

const mockUserModel = {
  create: jest.fn(),
  findOne: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: typeof User;
  let bcryptHash: jest.Mock;

  beforeEach(async () => {
    bcryptHash = bcrypt.hash as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<typeof User>(getModelToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash the password and create a new user', async () => {
      const userData = { email: 'test@example.com', password: 'Password123' };
      const hashedPassword = 'hashedPassword';
      const savedUser = { id: 1, email: userData.email, password: hashedPassword };

      bcryptHash.mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue(savedUser);

      const result = await service.create(userData);

      expect(bcryptHash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
      expect(result).toEqual(savedUser);
    });

    it('should throw an error if password hashing fails', async () => {
      const userData = { email: 'test@example.com', password: 'Password123' };
      bcryptHash.mockRejectedValue(new Error('Hashing Error'));

      await expect(service.create(userData)).rejects.toThrow('Hashing Error');
      expect(bcryptHash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should throw an error if user creation fails', async () => {
      const userData = { email: 'test@example.com', password: 'Password123' };
      const hashedPassword = 'hashedPassword';

      bcryptHash.mockResolvedValue(hashedPassword);
      mockUserModel.create.mockRejectedValue(new Error('Creation Error'));

      await expect(service.create(userData)).rejects.toThrow('Creation Error');
      expect(bcryptHash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
    });
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email, password: 'hashedPassword' };

      mockUserModel.findOne.mockResolvedValue(user);

      const result = await service.findOne(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      const email = 'nonexistent@example.com';

      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findOne(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });

    it('should throw an error if find operation fails', async () => {
      const email = 'test@example.com';

      mockUserModel.findOne.mockRejectedValue(new Error('Find Error'));

      await expect(service.findOne(email)).rejects.toThrow('Find Error');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });
});

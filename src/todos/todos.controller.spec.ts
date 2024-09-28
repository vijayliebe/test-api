import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

describe('TodosController', () => {
  let controller: TodosController;
  let service: TodosService;

  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    userId: 1,
  };

  const mockTodos = {
    rows: [mockTodo],
    count: 1,
  };

  const mockTodosService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true), // Always allow
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: mockTodosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get<TodosService>(TodosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of todos with default parameters', async () => {
      mockTodosService.findAll.mockResolvedValue(mockTodos);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(10, 0, undefined, undefined, 'ASC');
      expect(result).toEqual(mockTodos);
    });

    it('should return an array of todos with provided parameters', async () => {
      mockTodosService.findAll.mockResolvedValue(mockTodos);

      const result = await controller.findAll(5, 2, 'test', 'title', 'DESC');

      expect(service.findAll).toHaveBeenCalledWith(5, 2, 'test', 'title', 'DESC');
      expect(result).toEqual(mockTodos);
    });
  });

  describe('create', () => {
    const req = { user: { userId: 1 } };

    it('should create a new todo', async () => {
      const body = { title: 'New Todo', description: 'New Description' };
      const createdTodo = { ...body, id: 2, userId: 1 };

      mockTodosService.create.mockResolvedValue(createdTodo);

      const result = await controller.create(body, req);

      expect(service.create).toHaveBeenCalledWith({ ...body, userId: 1 });
      expect(result).toEqual(createdTodo);
    });

    it('should throw BadRequestException if title is missing', async () => {
      const body = { description: 'New Description' };

      await expect(controller.create(body, req)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if description is missing', async () => {
      const body = { title: 'New Todo' };

      await expect(controller.create(body, req)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a todo by ID', async () => {
      mockTodosService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('update', () => {
    const req = { user: { userId: 1 } };

    it('should update a todo', async () => {
      const body = { title: 'Updated Title', description: 'Updated Description' };
      mockTodosService.update.mockResolvedValue([1]);

      const result = await controller.update(1, body);

      expect(service.update).toHaveBeenCalledWith(1, body);
      expect(result).toEqual([1]);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      mockTodosService.remove.mockResolvedValue(1);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(1);
    });
  });
});

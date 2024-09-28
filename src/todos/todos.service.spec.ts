import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { getModelToken } from '@nestjs/sequelize';
import { Todo } from './todo.model';
import { Op } from 'sequelize';

describe('TodosService', () => {
  let service: TodosService;
  let model: typeof Todo;

  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    userId: 1,
    destroy: jest.fn(),
  };

  const mockTodos = {
    rows: [mockTodo],
    count: 1,
  };

  const mockTodoModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo),
          useValue: mockTodoModel,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    model = module.get<typeof Todo>(getModelToken(Todo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todoData = { title: 'New Todo', description: 'New Description', userId: 1 };
      const createdTodo = { ...todoData, id: 2 };

      mockTodoModel.create.mockResolvedValue(createdTodo);

      const result = await service.create(todoData);

      expect(model.create).toHaveBeenCalledWith(todoData);
      expect(result).toEqual(createdTodo);
    });

    it('should throw an error if creation fails', async () => {
      const todoData = { title: 'New Todo', description: 'New Description', userId: 1 };
      const error = new Error('Creation Error');

      mockTodoModel.create.mockRejectedValue(error);

      await expect(service.create(todoData)).rejects.toThrow('Creation Error');
      expect(model.create).toHaveBeenCalledWith(todoData);
    });
  });

  describe('findAll', () => {
    it('should return all todos with default parameters', async () => {
      mockTodoModel.findAndCountAll.mockResolvedValue(mockTodos);

      const result = await service.findAll(10, 0);

      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        where: {},
        order: [],
      });
      expect(result).toEqual(mockTodos);
    });

    it('should return filtered todos with search and sorting', async () => {
      const search = 'test';
      const sortField = 'title';
      const sortOrder = 'DESC';

      mockTodoModel.findAndCountAll.mockResolvedValue(mockTodos);

      const result = await service.findAll(5, 0, search, sortField, sortOrder);

      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 5,
        offset: 0,
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        },
        order: [[sortField, sortOrder]],
      });
      expect(result).toEqual(mockTodos);
    });

    it('should handle undefined search and sortField', async () => {
      mockTodoModel.findAndCountAll.mockResolvedValue(mockTodos);

      const result = await service.findAll(5, 0, 'undefined', 'undefined');

      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 5,
        offset: 0,
        where: {},
        order: [],
      });
      expect(result).toEqual(mockTodos);
    });

    it('should throw an error if findAndCountAll fails', async () => {
      const error = new Error('Database Error');

      mockTodoModel.findAndCountAll.mockRejectedValue(error);

      await expect(service.findAll(10, 0)).rejects.toThrow('Database Error');
      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        where: {},
        order: [],
      });
    });
  });

  describe('findOne', () => {
    it('should return a todo by ID', async () => {
      mockTodoModel.findByPk.mockResolvedValue(mockTodo);

      const result = await service.findOne(1);

      expect(model.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTodo);
    });

    it('should return null if todo is not found', async () => {
      mockTodoModel.findByPk.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(model.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should throw an error if findByPk fails', async () => {
      const error = new Error('Database Error');

      mockTodoModel.findByPk.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow('Database Error');
      expect(model.findByPk).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateData = { title: 'Updated Title', description: 'Updated Description' };
      mockTodoModel.update.mockResolvedValue([1]);

      const result = await service.update(1, updateData);

      expect(model.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
      expect(result).toEqual([1]);
    });

    it('should throw an error if update fails', async () => {
      const updateData = { title: 'Updated Title', description: 'Updated Description' };
      const error = new Error('Update Error');

      mockTodoModel.update.mockRejectedValue(error);

      await expect(service.update(1, updateData)).rejects.toThrow('Update Error');
      expect(model.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      mockTodoModel.findByPk.mockResolvedValue(mockTodo);

      await service.remove(1);

      expect(model.findByPk).toHaveBeenCalledWith(1);
      expect(mockTodo.destroy).toHaveBeenCalled();
    });

    it('should throw an error if todo is not found', async () => {
      mockTodoModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow('Cannot read properties of null (reading \'destroy\')');
      expect(model.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw an error if destroy fails', async () => {
      mockTodoModel.findByPk.mockResolvedValue(mockTodo);
      const error = new Error('Delete Error');
      mockTodo.destroy.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow('Delete Error');
      expect(model.findByPk).toHaveBeenCalledWith(1);
      expect(mockTodo.destroy).toHaveBeenCalled();
    });
  });
});

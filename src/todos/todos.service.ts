import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Todo } from './todo.model';
import { Op } from 'sequelize';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo)
    private todoModel: typeof Todo
  ) { }

  async create(todo: any): Promise<Todo> {
    return this.todoModel.create(todo);
  }

  async findAll(limit: number, offset: number, search?: string, sortField?: string, sortOrder: 'ASC' | 'DESC' = 'ASC'): Promise<{ rows: Todo[]; count: number }> {

    const whereCondition = search && search !== "undefined"
      ? {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      }
      : {};

    const order: any = sortField && sortField !== "undefined" ? [[sortField, sortOrder]] : [];

    const { rows, count } = await this.todoModel.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      order
    });

    return { rows, count };
  }

  async findOne(id: number): Promise<Todo> {
    return this.todoModel.findByPk(id);
  }

  async update(id: number, data: any): Promise<any> {
    return this.todoModel.update(data, { where: { id } });
  }

  async remove(id: number): Promise<void> {
    const todo = await this.findOne(id);
    await todo.destroy();
  }
}

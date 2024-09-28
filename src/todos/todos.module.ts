import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Todo } from './todo.model';
import { User } from '../users/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Todo, User])],
  providers: [TodosService],
  controllers: [TodosController],
})
export class TodosModule {}

import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table
export class Todo extends Model<Todo> {
  @Column
  title: string;

  @Column
  description: string;

  @ForeignKey(() => User)
  @Column
  userId: number;
}

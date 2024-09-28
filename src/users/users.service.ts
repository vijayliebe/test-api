import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async create(userData: any): Promise<User> {
    const hash = await bcrypt.hash(userData.password, 10);
    return this.userModel.create({ ...userData, password: hash });
  }

  async findOne(email: string): Promise<User> {
    return this.userModel.findOne({ where: { email } });
  }
}

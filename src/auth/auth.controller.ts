import { Controller, Post, Body, Request, UseGuards, Req, 
  UnauthorizedException, HttpCode, 
  ConflictException, BadRequestException,
  InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) { }


  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('register')
  async register(@Body() body) {
    const { email, password } = body;
    const emailFormat: any = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (email !== '' && !email.match(emailFormat)) {
      throw new BadRequestException('Provide valid email');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    try {
      const user = await this.usersService.create(body);
      return user;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(200)
  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(
      body.email,
      body.password
    );

    if (!user) {
      throw new UnauthorizedException("This user doesn't exist");
    }

    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Logout User' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @UseGuards(JwtAuthGuard)  // Ensure the user is logged in to log out
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.logout(req.user);
    return { message: 'Successfully logged out' };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  Query
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiHeader, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) { }

  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({ status: 200, description: 'todos array' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit the number of todos returned' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of todos to skip' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term to filter todos by title or description' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort the results by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (ASC or DESC)' })
  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    const parsedLimit = limit ? parseInt(limit as any, 10) : 10; 
    const parsedOffset = offset ? parseInt(offset as any, 10) : 0; 

    return this.todosService.findAll(parsedLimit, parsedOffset, search, sortField, sortOrder);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add todo' })  
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'description'],
    },
  })
  @ApiResponse({ status: 201, description: 'todo object' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body, @Request() req) {
    const { title, description } = body;

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    if (!description) {
      throw new BadRequestException('Description is required');
    }

    return this.todosService.create({ ...body, userId: req.user.userId });
  }

  @ApiOperation({ summary: 'Get todos by id' })
  @ApiResponse({ status: 200, description: 'todo object' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.todosService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update todo by id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'description'],
    },
  })
  @ApiResponse({ status: 200, description: 'updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() body) {
    return this.todosService.update(id, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete todos by id' })
  @ApiResponse({ status: 200, description: 'total record changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.todosService.remove(id);
  }
}

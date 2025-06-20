import {
  Controller,
  Get,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GetUserByIdQuery } from '../../../application/queries/get-user-by-id.query';
import { GetUserByEmailQuery } from '../../../application/queries/get-user-by-email.query';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Obtiene la información del perfil del usuario actualmente autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
  })
  async getProfile(@Request() req: any) {
    const userId = req.user.id;
    this.logger.log(`Obteniendo perfil del usuario: ${userId}`);

    const query = new GetUserByIdQuery(userId);
    const user = await this.queryBus.execute(query);

    this.logger.log(`Perfil obtenido: ${user.email}`);

    return {
      message: 'Perfil obtenido exitosamente',
      data: user,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene la información de un usuario específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserById(@Param('id') id: string) {
    this.logger.log(`Obteniendo usuario por ID: ${id}`);

    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute(query);

    this.logger.log(`Usuario obtenido: ${user.email}`);

    return {
      message: 'Usuario obtenido exitosamente',
      data: user,
    };
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener usuario por email',
    description: 'Obtiene la información de un usuario específico por su email',
  })
  @ApiParam({
    name: 'email',
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserByEmail(@Param('email') email: string) {
    this.logger.log(`Obteniendo usuario por email: ${email}`);

    const query = new GetUserByEmailQuery(email);
    const user = await this.queryBus.execute(query);

    this.logger.log(`Usuario obtenido: ${user.id}`);

    return {
      message: 'Usuario obtenido exitosamente',
      data: user,
    };
  }
}

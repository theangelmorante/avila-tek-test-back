import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return new User(
      user.id,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findById(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return new User(
      user.id,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );
  }

  async save(user: User): Promise<User> {
    const savedUser = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    });

    return new User(
      savedUser.id,
      savedUser.email,
      savedUser.password,
      savedUser.firstName,
      savedUser.lastName,
      savedUser.isActive,
      savedUser.createdAt,
      savedUser.updatedAt,
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });

    return count > 0;
  }
}

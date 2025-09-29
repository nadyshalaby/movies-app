import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });

    return new PaginatedResponseDto(users, page, limit, total);
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id },
        select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'avatarUrl', 'createdAt', 'updatedAt'],
      });
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch (error) {
      return null;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.findByEmail(updateUserDto.email);
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }
      }

      await this.userRepository.update(id, updateUserDto);
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userRepository.softDelete(id);
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userRepository.update(id, { isActive: false });
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Failed to deactivate user');
    }
  }

  async activate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userRepository.update(id, { isActive: true });
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Failed to activate user');
    }
  }
}
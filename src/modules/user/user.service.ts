import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './entities/follow.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { NotFoundMessage, publicMessage } from 'src/common/messages/public.message';
import { EntityName } from 'src/common/enums/entity.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
    @Inject(REQUEST) private req: Request,
  ) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const users = await this.userRepository.createQueryBuilder(EntityName.User)
      .leftJoinAndSelect("user.profile", "profile")
      .loadRelationCountAndMap("user.followers", "user.followers")
      .loadRelationCountAndMap("user.followings", "user.followings")
      .getMany();
    return {
      users
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(NotFoundMessage.notFound);
    return user;
  }

  async followToggle(followingId: number) {
    const { id: followerId } = this.req.user;
    if (followerId == followingId) throw new BadRequestException();
    await this.findOne(followingId);
    let message = publicMessage.followed;
    const isFollowed = await this.followRepository.findOneBy({ followerId, followingId });
    if (isFollowed) {
      await this.followRepository.delete(isFollowed);
      message = publicMessage.unfollowed;
    } else {
      await this.followRepository.insert({ followerId, followingId });
    }
    return {
      message,
    }

  }

  async showFollowers() {
    const { id } = this.req.user;
    const followers = await this.followRepository.find({
      where: { followingId: id },
      relations: ["follower"],
      select: {
        id: true,
        follower: {
          id: true,
          profile: {
            id: true,
            nick_name: true,
            profile_image: true,
          },
        }
      }
    });
    return {
      followers,
    }
  }

  async showFollowings() {
    const { id } = this.req.user;
    const followings = await this.followRepository.find({
      where: { followerId: id },
      relations: ["following"],
      select: {
        id: true,
        following: {
          id: true,
          username: true,
          profile: {
            id: true,
            nick_name: true,
            profile_image: true,
          },
        }
      }
    });
    return {
      followings,
    }
  }

  async blockUserToggle(id: number) {
    const user = await this.findOne(id);
    user.isBlocked = !user.isBlocked;
    await this.userRepository.save(user);
    const message = user.isBlocked ? publicMessage.blocked : publicMessage.unblocked;
    return {
      message
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

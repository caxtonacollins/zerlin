import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Alert } from '../entities/alert.entity';
import { FeeEstimate } from '../entities/fee-estimate.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(FeeEstimate)
    private feeEstimateRepository: Repository<FeeEstimate>,
    private redisService: RedisService,
  ) {}

  async getSystemStats() {
    const [totalUsers, totalAlerts, activeAlerts, totalEstimates] =
      await Promise.all([
        this.userRepository.count(),
        this.alertRepository.count(),
        this.alertRepository.count({ where: { isActive: true } }),
        this.feeEstimateRepository.count(),
      ]);

    // Calculate average response time from recent estimates
    const recentEstimates = await this.feeEstimateRepository.find({
      take: 100,
      order: { createdAt: 'DESC' },
    });

    // Mock response time calculation (you can implement actual tracking)
    const avgResponseTime = 150;

    // Get cache hit rate from Redis (mock for now)
    const cacheHitRate = 0.85;

    return {
      totalUsers,
      totalAlerts,
      activeAlerts,
      totalEstimates,
      avgResponseTime,
      cacheHitRate,
    };
  }

  async getUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['alerts'],
    });

    const usersWithStats = users.map((user) => ({
      id: user.id,
      stacksAddress: user.stacksAddress,
      email: user.email,
      createdAt: user.createdAt,
      alertCount: user.alerts?.length || 0,
      lastActive: null, // Can be implemented with activity tracking
    }));

    return {
      users: usersWithStats,
      total,
      page,
      limit,
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['alerts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      stacksAddress: user.stacksAddress,
      email: user.email,
      createdAt: user.createdAt,
      alertCount: user.alerts?.length || 0,
      alerts: user.alerts,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all user's alerts first
    await this.alertRepository.delete({ userId: id });

    // Delete user
    await this.userRepository.delete(id);

    return { message: 'User deleted successfully' };
  }

  async getAllAlerts(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [alerts, total] = await this.alertRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    const alertsWithUser = alerts.map((alert) => ({
      id: alert.id,
      userId: alert.userId,
      userAddress: alert.user?.stacksAddress || 'Unknown',
      targetFee: alert.targetFee,
      condition: alert.condition,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      triggerCount: 0, // Can be tracked separately
    }));

    return {
      alerts: alertsWithUser,
      total,
      page,
      limit,
    };
  }

  async toggleAlert(id: string, isActive: boolean) {
    const alert = await this.alertRepository.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    alert.isActive = isActive;
    await this.alertRepository.save(alert);

    return { message: 'Alert updated successfully', alert };
  }

  async deleteAlert(id: string) {
    const alert = await this.alertRepository.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    await this.alertRepository.delete(id);

    return { message: 'Alert deleted successfully' };
  }
}

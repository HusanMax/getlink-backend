import { Module } from '@nestjs/common';
import { ResourcesModule } from '../resources/resources.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [ResourcesModule],
  controllers: [AdminController, StatsController],
  providers: [AdminService],
})
export class AdminModule {}

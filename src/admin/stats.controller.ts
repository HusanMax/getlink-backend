import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AdminService } from './admin.service';

/** Public, read-only aggregate counts used by the marketing/home page. */
@Controller('stats')
export class StatsController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Get()
  stats() {
    return this.adminService.getStats();
  }
}

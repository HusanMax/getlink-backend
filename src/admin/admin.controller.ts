import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AuthAdmin, CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AdminService } from './admin.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResourceQueryDto } from '../resources/dto/resource-query.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  stats() {
    return this.adminService.getStats();
  }

  @Get('resources')
  listResources(@Query() query: ResourceQueryDto) {
    return this.adminService.listResources(query);
  }

  @Get('resources/:id')
  getResource(@Param('id') id: string) {
    return this.adminService.getResource(id);
  }

  @Post('resources/:id/feature')
  toggleFeatured(@Param('id') id: string) {
    return this.adminService.toggleResource(id, 'featured');
  }

  @Post('resources/:id/publish')
  togglePublished(@Param('id') id: string) {
    return this.adminService.toggleResource(id, 'published');
  }

  @Get('profile')
  profile(@CurrentAdmin() admin: AuthAdmin) {
    return this.adminService.getProfile(admin.id);
  }

  @Patch('password')
  changePassword(@CurrentAdmin() admin: AuthAdmin, @Body() dto: ChangePasswordDto) {
    return this.adminService.changePassword(admin.id, dto);
  }
}

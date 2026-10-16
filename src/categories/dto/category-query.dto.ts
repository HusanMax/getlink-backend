import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

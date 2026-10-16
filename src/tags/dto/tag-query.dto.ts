import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TagQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

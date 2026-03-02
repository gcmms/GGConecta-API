import { IsOptional, IsString, Matches } from 'class-validator';

export class ListBirthdaysQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^(\d{1,4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2})$/, {
    message: 'Use um formato válido em "from": MM-DD, DD/MM ou YYYY-MM-DD.'
  })
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\d{1,4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2})$/, {
    message: 'Use um formato válido em "to": MM-DD, DD/MM ou YYYY-MM-DD.'
  })
  to?: string;
}

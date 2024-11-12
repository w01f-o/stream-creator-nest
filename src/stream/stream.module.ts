import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { FileService } from '../file/file.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [StreamController],
  providers: [StreamService, FileService, DatabaseService],
})
export class StreamModule {}

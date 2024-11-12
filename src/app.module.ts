import { Module } from '@nestjs/common';
import { StreamModule } from './stream/stream.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';
import { FileFolder } from './enums/FileFolder.enum';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', FileFolder.STATIC),
    }),
    StreamModule,
    FileModule,
    DatabaseModule,
  ],
})
export class AppModule {}

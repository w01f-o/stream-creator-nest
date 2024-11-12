import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileService } from '../file/file.service';
import { FileFolder } from '../enums/FileFolder.enum';
import * as path from 'node:path';
import { DatabaseService } from '../database/database.service';
import * as ffmpeg from 'fluent-ffmpeg';
import { Stream } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { existsSync } from 'node:fs';
import * as fsPromises from 'fs/promises';
import { CreateStreamDto } from './dto/create.dto';

@Injectable()
export class StreamService {
  private readonly logger: Logger = new Logger(StreamService.name);

  public constructor(
    private readonly fileService: FileService,
    private readonly databaseService: DatabaseService,
  ) {}

  public async findAll(): Promise<Stream[]> {
    return this.databaseService.stream.findMany();
  }

  public async deleteAll() {
    await Promise.all([
      await fsPromises.rm(this.fileService.getStaticPath(FileFolder.HLS), {
        recursive: true,
        force: true,
      }),
      await fsPromises.rm(this.fileService.getStaticPath(FileFolder.VIDEO), {
        recursive: true,
        force: true,
      }),
      await this.databaseService.stream.deleteMany(),
    ]);
  }

  public async deleteById(id: string) {
    const { filepath } = await this.databaseService.stream.delete({
      where: { id },
    });

    await fsPromises.rm(
      path.join(__dirname, '..', '..', 'static', path.dirname(filepath)),
      {
        recursive: true,
        force: true,
      },
    );
  }

  public async createHlsStream(
    filepath: string,
    dto: CreateStreamDto,
  ): Promise<string> {
    const outputDir = path.join(
      this.fileService.getStaticPath(FileFolder.HLS),
      uuid(),
    );

    const outputM3u8 = path.join(outputDir, 'stream.m3u8');

    if (!existsSync(outputDir)) {
      await fsPromises.mkdir(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      ffmpeg(filepath)
        .outputOptions([
          '-codec: copy',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
        ])
        .output(outputM3u8)
        .on('end', async () => {
          const { filepath: streamPath, id } =
            await this.databaseService.stream.create({
              data: {
                filepath: `/${path
                  .join(
                    FileFolder.HLS,
                    path.basename(outputDir),
                    path.basename(outputM3u8),
                  )
                  .replaceAll('\\', '/')}`,
                name: dto.name,
              },
            });

          setTimeout(async () => {
            await Promise.all([
              await this.databaseService.stream.delete({
                where: {
                  id,
                },
              }),
              await fsPromises.rm(
                path.join(
                  __dirname,
                  '..',
                  '..',
                  'static',
                  path.dirname(streamPath),
                ),
                {
                  recursive: true,
                  force: true,
                },
              ),
            ]);
          }, 7200);

          await fsPromises.rm(filepath);

          this.logger.log(`Stream successfully created: ${streamPath}`);

          resolve(streamPath);
        })
        .on('error', (error) => {
          this.logger.error(`FFmpeg error: ${error}`);

          reject(
            new InternalServerErrorException('Failed to create HLS stream'),
          );
        })
        .run();
    });
  }
}

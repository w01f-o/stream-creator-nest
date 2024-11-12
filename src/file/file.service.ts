import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'node:fs';
import * as fsPromises from 'fs/promises';
import * as path from 'node:path';
import { FileFolder } from '../enums/FileFolder.enum';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);

  public getStaticPath(location: FileFolder): string {
    const staticPath = path.join(
      __dirname,
      '..',
      '..',
      FileFolder.STATIC,
      location,
    );

    if (!fs.existsSync(staticPath)) {
      fs.mkdirSync(staticPath, { recursive: true });
    }

    return staticPath;
  }

  public async uploadFile(
    file: Express.Multer.File,
    location: FileFolder,
  ): Promise<string> {
    const fileName = this.generateFilename(file);
    const filePath = path.join(this.getStaticPath(location), fileName);

    try {
      await fsPromises.writeFile(filePath, file.buffer);
      this.logger.log(`File successfully uploaded: ${fileName}`);

      return filePath;
    } catch (error) {
      this.logger.error(`Failed to save file: ${error}`);

      throw new InternalServerErrorException('Failed to save file');
    }
  }

  private generateFilename(file: Express.Multer.File): string {
    return `${uuid()}${path.extname(file.originalname)}`;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { FileService } from '../file/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFolder } from '../enums/FileFolder.enum';
import { CreateStreamDto } from './dto/create.dto';

@Controller('stream')
export class StreamController {
  constructor(
    private readonly streamService: StreamService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  public async findAll() {
    return await this.streamService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('video'))
  public async createStream(
    @UploadedFile() video: Express.Multer.File,
    @Body() dto: CreateStreamDto,
  ) {
    const filePath = await this.fileService.uploadFile(video, FileFolder.VIDEO);

    return await this.streamService.createHlsStream(filePath, dto);
  }

  @Delete()
  public async clearAllStreams() {
    await this.streamService.clearAll();

    return {
      message: 'Successfully',
    };
  }
}

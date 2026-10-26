import { CurrentUser, OkResponseDto, type AuthUser, type UploadedFileData } from "@app/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import { ImageCountsDto } from "./dto/image-counts.dto.js";
import { ImagePageDto } from "./dto/image-page.dto.js";
import { ImageParamDto } from "./dto/image-param.dto.js";
import { ImageDto } from "./dto/image.dto.js";
import { ListImagesQueryDto } from "./dto/list-images-query.dto.js";
import { PageQueryDto } from "./dto/page-query.dto.js";
import { UploadImageDto } from "./dto/upload-image.dto.js";
import { ImagesService } from "./images.service.js";

const notFound = () => new NotFoundException("Image not found");

// /images: the signed-in user's gallery
@ApiTags("Images")
@ApiBearerAuth()
@Controller("images")
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  @Get()
  @ApiOperation({ summary: "List active or scheduled images" })
  @ApiOkResponse({ type: ImagePageDto })
  list(@Query() { status, page, pageSize }: ListImagesQueryDto, @CurrentUser() user: AuthUser): Promise<ImagePageDto> {
    return this.images.list(user.id, status, page, pageSize);
  }

  @Get("bin")
  @ApiOperation({ summary: "List binned images" })
  @ApiOkResponse({ type: ImagePageDto })
  bin(@Query() { page, pageSize }: PageQueryDto, @CurrentUser() user: AuthUser): Promise<ImagePageDto> {
    return this.images.bin(user.id, page, pageSize);
  }

  @Get("counts")
  @ApiOperation({ summary: "Counts per view" })
  @ApiOkResponse({ type: ImageCountsDto })
  counts(@CurrentUser() user: AuthUser): Promise<ImageCountsDto> {
    return this.images.counts(user.id);
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload an image, now or at scheduledAt" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadImageDto })
  @ApiCreatedResponse({ type: ImageDto })
  upload(
    @UploadedFile() file: UploadedFileData | undefined,
    @Body() { scheduledAt }: UploadImageDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ImageDto> {
    return this.images.upload(user.id, file, scheduledAt);
  }

  @Get(":id/file")
  @Header("Cache-Control", "private, max-age=3600")
  @ApiOperation({ summary: "Image bytes" })
  @ApiProduces("image/*")
  @ApiOkResponse({ description: "The image" })
  async file(@Param() { id }: ImageParamDto, @CurrentUser() user: AuthUser): Promise<StreamableFile> {
    const file = await this.images.file(id, user.id);
    if (!file) throw notFound();
    return file;
  }

  @Delete(":id")
  @ApiOperation({ summary: "Move an image to the bin" })
  @ApiOkResponse({ type: OkResponseDto })
  async remove(@Param() { id }: ImageParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    if (!(await this.images.moveToBin(id, user.id))) throw notFound();
    return { ok: true };
  }

  @Post(":id/restore")
  @HttpCode(200)
  @ApiOperation({ summary: "Restore a binned image" })
  @ApiOkResponse({ type: ImageDto })
  async restore(@Param() { id }: ImageParamDto, @CurrentUser() user: AuthUser): Promise<ImageDto> {
    const image = await this.images.restore(id, user.id);
    if (!image) throw notFound();
    return image;
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Delete a binned image for good" })
  @ApiOkResponse({ type: OkResponseDto })
  async purge(@Param() { id }: ImageParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    if (!(await this.images.purge(id, user.id))) throw notFound();
    return { ok: true };
  }
}

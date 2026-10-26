import { CurrentUser, OkResponseDto, Public, type AuthUser } from "@app/common";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ObjectStorageService, type UploadedFileData } from "backend-common";
import { AuthUserDto } from "../auth/dto/auth-user.dto.js";
import { AccountService } from "./account.service.js";
import { DeleteAccountDto } from "./dto/delete-account.dto.js";
import { UserIdParamDto } from "./dto/user-id-param.dto.js";

@ApiTags("Account")
@Controller()
export class AccountController {
  constructor(
    private readonly account: AccountService,
    private readonly storage: ObjectStorageService,
  ) {}

  @Public()
  @Get("avatars/:userId")
  async avatar(@Param() { userId }: UserIdParamDto): Promise<StreamableFile> {
    const key = await this.account.findAvatarKey(userId);
    if (!key) throw new NotFoundException("Avatar not found");
    return this.storage.streamFile(key, { inline: true });
  }

  @Post("account/avatar")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { photo: { type: "string", format: "binary" } } } })
  @ApiOkResponse({ type: AuthUserDto })
  uploadAvatar(
    @UploadedFile() file: UploadedFileData | undefined,
    @CurrentUser() user: AuthUser,
  ): Promise<AuthUserDto> {
    if (!file) throw new BadRequestException("No image uploaded");
    return this.account.saveAvatar(user.id, file);
  }

  @Delete("account/avatar")
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthUserDto })
  removeAvatar(@CurrentUser() user: AuthUser): Promise<AuthUserDto> {
    return this.account.removeAvatar(user.id);
  }

  @Delete("account")
  @ApiBearerAuth()
  @ApiOkResponse({ type: OkResponseDto })
  async deleteAccount(@Body() { password }: DeleteAccountDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    await this.account.deleteAccount(user.id, password);
    return { ok: true };
  }
}

import { CurrentUser, OkResponseDto, type AuthUser } from "@app/common";
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateLinkDto } from "./dto/create-link.dto.js";
import { LinkListDto } from "./dto/link-list.dto.js";
import { LinkParamDto } from "./dto/link-param.dto.js";
import { LinkStatsDto } from "./dto/link-stats.dto.js";
import { LinkDto } from "./dto/link.dto.js";
import { UpdateLinkDto } from "./dto/update-link.dto.js";
import { LinksService } from "./links.service.js";

const notFound = () => new NotFoundException("Link not found");

@ApiTags("Links")
@ApiBearerAuth()
@Controller("links")
export class LinksController {
  constructor(private readonly links: LinksService) {}

  @Get()
  @ApiOperation({ summary: "The caller's links, newest first" })
  @ApiOkResponse({ type: LinkListDto })
  async list(@CurrentUser() user: AuthUser): Promise<LinkListDto> {
    return { links: await this.links.list(user.id) };
  }

  @Post()
  @ApiOperation({ summary: "Create a short link" })
  @ApiCreatedResponse({ type: LinkDto })
  create(@Body() body: CreateLinkDto, @CurrentUser() user: AuthUser): Promise<LinkDto> {
    return this.links.create(user.id, body);
  }

  @Get(":id")
  @ApiOkResponse({ type: LinkDto })
  async get(@Param() { id }: LinkParamDto, @CurrentUser() user: AuthUser): Promise<LinkDto> {
    const link = await this.links.get(id, user.id);
    if (!link) throw notFound();
    return link;
  }

  @Patch(":id")
  @ApiOkResponse({ type: LinkDto })
  async update(
    @Param() { id }: LinkParamDto,
    @Body() body: UpdateLinkDto,
    @CurrentUser() user: AuthUser,
  ): Promise<LinkDto> {
    const link = await this.links.update(id, user.id, body);
    if (!link) throw notFound();
    return link;
  }

  @Delete(":id")
  @ApiOkResponse({ type: OkResponseDto })
  async remove(@Param() { id }: LinkParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    if (!(await this.links.remove(id, user.id))) throw notFound();
    return { ok: true };
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Clicks per day for the last 30 days" })
  @ApiOkResponse({ type: LinkStatsDto })
  async stats(@Param() { id }: LinkParamDto, @CurrentUser() user: AuthUser): Promise<LinkStatsDto> {
    const stats = await this.links.stats(id, user.id);
    if (!stats) throw notFound();
    return stats;
  }
}

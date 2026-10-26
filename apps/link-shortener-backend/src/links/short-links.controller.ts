import { Public } from "@app/common";
import { Controller, Get, Headers, NotFoundException, Param, Redirect } from "@nestjs/common";
import { ApiFoundResponse, ApiNotFoundResponse, ApiTags } from "@nestjs/swagger";
import { ErrorResponseDto } from "backend-common";
import { SlugParamDto } from "./dto/slug-param.dto.js";
import { LinksService } from "./links.service.js";

// The short link itself: 302 to the target URL and one click recorded (the frontend proxies /r/* here)
@ApiTags("Short links")
@Controller("r")
export class ShortLinksController {
  constructor(private readonly links: LinksService) {}

  @Public()
  @Get(":slug")
  @Redirect()
  @ApiFoundResponse({ description: "Redirects to the link's URL" })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async follow(
    @Param() { slug }: SlugParamDto,
    @Headers("referer") referrer: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.links.resolve(slug, referrer ?? null, userAgent ?? null);
    if (!url) throw new NotFoundException("This link does not exist or has expired");
    return { url, statusCode: 302 };
  }
}

import CapyCloudAPI from '@src/infrastructure/capy-cloud/client'
import { CommonContext } from '@src/tgbot/models/context'
import { NextFunction } from 'grammy'

export class CapyCloudAPIMiddleware {
  constructor(
    private readonly capyCloudAPI: CapyCloudAPI,
  ) { }

  handle(ctx: CommonContext, next: NextFunction) {
    ctx.capyCloudAPI = this.capyCloudAPI

    return next()
  }
}

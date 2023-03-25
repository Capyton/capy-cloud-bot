import { NextFunction } from 'grammy'
import CapyCloudAPI from '@src/infrastructure/capy-cloud/client'
import MyContext from '@src/tgbot/models/Context'


export class CapyCloudAPIMiddleware {
  constructor(
    private readonly capyCloudAPI: CapyCloudAPI,
  ) { }

  handle(ctx: MyContext, next: NextFunction) {
    ctx.capyCloudAPI = this.capyCloudAPI
    return next()
  }
}

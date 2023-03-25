import { NextFunction } from 'grammy'
import CapyCloudAPI from '@src/infrastructure/capy-cloud/client'
import MyContext from '@src/tgbot/models/Context'

export function attachCapyCloudAPI(ctx: MyContext, next: NextFunction) {
  if (!process.env.CapyCloudBaseUrl) {
    console.log('CapyCloudBaseUrl is not set')
    return next()
  }
  ctx.CapyCloudAPI = new CapyCloudAPI(
    process.env.CapyCloudBaseUrl,
    ctx.message?.from.id.toString() ? ctx.message?.from.id.toString() : 'error'
  )
  return next()
}

import MyContext from '@src/tgbot/models/Context'
import { address } from 'ton-core'

export async function handleSettings(ctx: MyContext) {
  const text = `🛠 Settings\n\nCurrent provider address: <code>${address(
    ctx.tgUser!.providerAddress
  ).toString()}</code>`
  await ctx.reply(text, { parse_mode: 'HTML' })
}

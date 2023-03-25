import MyContext from '@src/tgbot/models/Context'
import { TgUser } from '@src/entities/tg-user'
import { uuid7 } from '@src/utils/uuid'
import { handleTonConnectionLogin } from './ton-connect'


export async function handleUnknownUser(ctx: MyContext) {
  const fromUser = ctx.from!
  const tgUser = new TgUser(
    uuid7(),
    fromUser.id,
    fromUser.first_name,
    fromUser.last_name || null,
    fromUser.username || null,
    null,
  )
  await ctx.tgUserRepo.addTgUser(tgUser)
  await ctx.uow.commit()

  ctx.tgUser = tgUser

  const lastName = fromUser.last_name
  const fullName =
    fromUser.first_name + (lastName ? ' ' + lastName : '')

  await ctx.reply(`Hi, ${fullName}
Welcome to CapyCloud, a decentralized and convenient solution for communication with the Ton Storage. 

If you have any questions, feel free to write @coalus 

Good use!`)
  await ctx.reply('Ok, now lets login into your wallet')
  await handleTonConnectionLogin(ctx)
}
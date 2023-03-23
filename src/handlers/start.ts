import MyContext from '@src/models/Context'
import { TgUser } from '@src/models/tg-user'
import { uuid7 } from '@src/utils/uuid'


export async function handleUnknownUser(ctx: MyContext) {
  const fromUser = ctx.from!
  const tgUser = new TgUser(
    uuid7(), fromUser.id, fromUser.first_name, fromUser.last_name || null, fromUser.username || null,
  )
  await ctx.tgUserRepo.addTgUser(tgUser)
  await ctx.uow.commit()

  ctx.tgUser = tgUser
  return await handleStart(ctx)
}


export async function handleStart(ctx: MyContext) {
  const lastName = ctx.message?.from?.last_name
  const userName =
    ctx.message?.from?.first_name + (lastName ? ' ' + lastName : '')
      
  const text = `Hi, ${userName}
Welcome to CapyCloud, a decentralized and convenient solution for communication with the Ton Storage. 

In order to get started, you can simply send your file, or a ready-made bagID, our bot will do the rest of the work.
    
If you have any questions, feel free to write @coalus 
    
Good use!`

  await ctx.reply(text)
}

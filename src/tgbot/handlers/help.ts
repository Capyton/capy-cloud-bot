import { CommonContext } from '@src/tgbot/models/context'

export async function help(ctx: CommonContext) {
  const message = ctx.message!
  const user = ctx.from!
  const lastName = user.last_name
  const fullName = user.first_name + (lastName ? ' ' + lastName : '')

  await ctx.reply(
    'This is help message',
    {
      message_thread_id: message.message_thread_id,
    }
  )
}

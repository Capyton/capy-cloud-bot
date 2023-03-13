import { Context } from 'grammy'

export async function handleStart(ctx: Context) {
  const userName =
    ctx.message?.from?.first_name + ' ' + ctx.message?.from?.last_name
  const text = `Hi, ${userName}
Welcome to CapyCloud, a decentralized and convenient solution for communication with the Ton Storage. 

In order to get started, you can simply send your file, or a ready-made bagID, our bot will do the rest of the work.
    
If you have any questions, feel free to write @coalus 
    
Good use!`

  await ctx.reply(text)
}

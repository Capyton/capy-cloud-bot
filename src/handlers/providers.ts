import MyContext from '@/models/Context'

import { fromNano } from 'ton-core'

const convertBytes = function(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  if (bytes == 0) {
    return "n/a"
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  if (i == 0) {
    return bytes + " " + sizes[i]
  }

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}

export async function handleProvider(ctx: MyContext) {
  const providerAddress = ctx.message?.text
  // @ts-ignore
  const providerInfo = await ctx.CapyCloudAPI.getProviderParams(providerAddress)

  const textAboutProvider = `
Provider: <code>${providerAddress}</code>

Max file size: ${convertBytes(providerInfo.maxFileSize)}
Min file size: ${convertBytes(providerInfo.minFileSize)}
Accept new files: ${providerInfo.acceptNewContracts}
Rate mb/day: ${fromNano(providerInfo.ratePerMbDay)} TON
  `
  const text = providerInfo
    ? textAboutProvider
    : 'Cant get provider info. Check address you sent.'
  ctx.reply(text, {parse_mode: "HTML"})
}

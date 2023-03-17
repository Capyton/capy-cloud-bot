import MyContext from '@/models/Context'

export async function handleProvider(ctx: MyContext) {
  const providerAddress = ctx.message?.text
  // @ts-ignore
  const providerInfo = await ctx.CapyCloudAPI.getProviderParams(providerAddress)

  const textAboutProvider = `
Provider: ${providerAddress}

Max/min file size: ${providerInfo.maxFileSize}, ${providerInfo.minFileSize}
Accept new contracts: ${providerInfo.acceptNewContracts}
Rate mb/day: ${providerInfo.ratePerMbDay} TON
  `
  const text = providerInfo
    ? textAboutProvider
    : 'Cant get provider info. Check address you sent.'
  ctx.reply(text)
}

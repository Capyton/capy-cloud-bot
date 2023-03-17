import CapyCloudAPI from '@/services/api'

import { Context as BaseContext } from 'grammy'
import { type ConversationFlavor } from '@grammyjs/conversations'

class Context extends BaseContext {
  CapyCloudAPI: CapyCloudAPI
}
type MyContext = Context & ConversationFlavor
export default MyContext

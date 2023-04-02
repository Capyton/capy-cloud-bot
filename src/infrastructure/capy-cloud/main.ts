import CapyCloudAPI from './client'
import { CapyCloudAPIConfig } from './config'

export function initCapyCloudClient(config: CapyCloudAPIConfig): CapyCloudAPI {
  return new CapyCloudAPI(config.apiBaseUrl, config.authToken)
}

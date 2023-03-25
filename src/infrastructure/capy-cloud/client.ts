import axios, { AxiosInstance, AxiosResponse } from 'axios'
import {
  Bag,
  Provider,
  NewContractMessageResponse,
  ProviderParams,
  File,
  CreateTorrentRequest,
  Torrent,
  AuthPayload,
  AuthToken,
} from './schemas/api'

class CapyCloudAPI {
  private axiosInstance: AxiosInstance

  constructor(apiBaseUrl: string, authToken: string) {
    this.axiosInstance = axios.create({
      baseURL: apiBaseUrl.concat('/api/v1'),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
  }

  async generatePayload(): Promise<AuthPayload> {
    const response: AxiosResponse<AuthPayload> = await this.axiosInstance.post('/auth/payload')
    if (response.status !== 201) {
      throw new Error('Failed to generate payload')
    }
    return response.data
  }

  async verifyPayload(data: any): Promise<AuthToken> {
    const response: AxiosResponse<AuthToken> = await this.axiosInstance.post('/auth', data)
    if (response.status !== 201) {
      throw new Error('Failed to verify payload')
    }
    return response.data
  }

  async getAllProviders(): Promise<Provider[]> {
    const response: AxiosResponse<Provider[]> = await this.axiosInstance.get(
      '/providers'
    )
    return response.data
  }

  async getProviderById(providerAddress: string): Promise<Provider> {
    const response: AxiosResponse<Provider> = await this.axiosInstance.get(
      `/providers/${providerAddress}`
    )
    return response.data
  }

  async getNewContractMessage(
    providerAddress: string,
    bagId: string
  ): Promise<NewContractMessageResponse> {
    const response: AxiosResponse<NewContractMessageResponse> =
      await this.axiosInstance.get(
        `/providers/${providerAddress}/bag/${bagId}/new-contract-message`
      )
    return response.data
  }

  async getProviderParams(providerAddress: string): Promise<ProviderParams> {
    const response: AxiosResponse<ProviderParams> =
      await this.axiosInstance.get(`/providers/${providerAddress}/params`)
    return response.data
  }
  async createTorrent(request: CreateTorrentRequest): Promise<Torrent> {
    const response = await this.axiosInstance.post('/create-torrent', request)
    return response.data
  }

  async getTorrent(bagID: string): Promise<Torrent> {
    const response = await axios.get<Torrent>(`/get-torrent/${bagID}`)
    return response.data
  }
}

export default CapyCloudAPI

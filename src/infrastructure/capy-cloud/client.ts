import {
  AuthPayload,
  AuthTokens,
  Bag,
  CreateTorrentRequest,
  File,
  NewContractMessageResponse,
  Proof,
  Provider,
  ProviderParams,
  Torrent,
} from './schemas/api'
import { TonProofItemReplySuccess, Wallet, toUserFriendlyAddress } from '@tonconnect/sdk'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

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

  generatePayload(): Promise<AuthPayload> {
    return this.axiosInstance.post('/auth/payload')
      .then((response: AxiosResponse<AuthPayload>) => {
        if (response.status !== 201) {
          throw new Error('Failed to generate payload')
        }
        return response.data
      })
  }

  verifyPayload(wallet: Wallet): Promise<AuthTokens> {
    const tonProof = (wallet.connectItems?.tonProof as TonProofItemReplySuccess).proof
    const tonAddress = toUserFriendlyAddress(wallet.account.address)
    const proof: Proof = {
      payloadNonce: tonProof.payload,
      signature: tonProof.signature,
      address: tonAddress,
      network: wallet.account.chain,
      timestamp: tonProof.timestamp,
      domainLengthBytes: tonProof.domain.lengthBytes,
      domainValue: tonProof.domain.value,
      stateInit: wallet.account.walletStateInit,
    }

    return this.axiosInstance.post('/auth', proof)
      .then((response: AxiosResponse<AuthTokens>) => {
        if (response.status !== 201) {
          throw new Error('Failed to verify payload')
        }
        return response.data
      })
  }

  getProviders(): Promise<Provider[]> {
    return this.axiosInstance.get('/providers')
      .then((response: AxiosResponse<Provider[]>) => response.data)
  }

  getNewContractMessage(providerAddress: string, bagId: string): Promise<NewContractMessageResponse> {
    return this.axiosInstance.get(`/providers/${providerAddress}/bags/${bagId}/new-contract-message`)
      .then((response: AxiosResponse<NewContractMessageResponse>) => response.data)
  }

  getProviderParams(providerAddress: string): Promise<ProviderParams> {
    return this.axiosInstance.get(`/providers/${providerAddress}/params`)
      .then((response: AxiosResponse<ProviderParams>) => response.data)
  }

  createTorrent(request: CreateTorrentRequest): Promise<Torrent> {
    return this.axiosInstance.post('/torrents', request)
      .then((response: AxiosResponse<Torrent>) => response.data)
  }

  addTorrentByBagId(bagId: string): Promise<Torrent> {
    return this.axiosInstance.post(`/torrents/${bagId}/add-by-bag-id`)
      .then((response: AxiosResponse<Torrent>) => response.data)
  }

  getTorrent(bagId: string): Promise<Torrent> {
    return this.axiosInstance.get(`/torrents/${bagId}`)
      .then((response: AxiosResponse<Torrent>) => response.data)
  }
}

export default CapyCloudAPI

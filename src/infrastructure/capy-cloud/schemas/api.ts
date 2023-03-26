export interface Bag {
  id: string
  bagId: string
  description?: string
  size: number
  isUploaded: boolean
  createdAt: string
}

export interface Provider {
  id: string
  address: string
  maxContracts?: number
  maxTotalSize?: number
  createdAt: string
}

export interface NewContractMessageResponse {
  payload: string
  ratePerMbDay?: number
  maxSpan?: number
}

export interface ProviderParams {
  acceptNewContracts: boolean
  ratePerMbDay: number
  maxSpan: number
  minFileSize: number
  maxFileSize: number
}

export interface File {
  name: string
  size: number
  priority: number
  downloadedSize: number
}

export interface CreateTorrentRequest {
  files: File[]
  bagDescription?: string
  filenames: string[]
  descriptions?: string[]
  pathDirs?: string[]
}

export interface Torrent {
  bagId: string
  bagHash: string
  totalSize: number
  description?: string
  filesCount: number
  includedSize: number
  downloadedSize: number
  activeDownload: boolean
  activeUpload: boolean
  completed: boolean
  downloadSpeed: number
  uploadSpeed: number
  fatalError?: string
  files: File[]
}

export interface AuthPayload {
  nonce: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface Proof {
  payloadNonce: string
  address: string
  network: "-3" | "-239"
  signature: string
  timestamp: number
  domainLengthBytes: number
  domainValue: string
  stateInit: string
}

import { Address, Cell, StateInit, beginCell, storeStateInit } from 'ton-core'
import TonConnect, {
  IStorage,
  Wallet,
  WalletInfo,
  WalletInfoRemote,
} from '@tonconnect/sdk'

import { SendProvider } from './send-provider'
import { Storage } from '@src/infrastructure/storage'

export const TRANSACTION_TIMEOUT = 5 * 60 * 1000

export interface ConnectWallet {
  url: string
  checker: Promise<Wallet>
}

class TonConnectStorage implements IStorage {
  constructor(
    public readonly inner: Storage,
  ) { }

  async setItem(key: string, value: string): Promise<void> {
    return await this.inner.setItem(key, value)
  }
  async getItem(key: string): Promise<string | null> {
    return await this.inner.getItem(key)
  }
  async removeItem(key: string): Promise<void> {
    return await this.inner.removeItem(key)
  }
}

function isRemote(walletInfo: WalletInfo): walletInfo is WalletInfoRemote {
  return 'universalLink' in walletInfo && 'bridgeUrl' in walletInfo
}

export class TonConnectProvider implements SendProvider {
  public readonly connector: TonConnect

  constructor(
    public readonly storage: Storage,
  ) {
    this.connector = new TonConnect({
      storage: new TonConnectStorage(storage),
      manifestUrl: 'https://jsonblob.com/api/jsonBlob/1086334593673740288',
    })
  }

  connect(): Promise<void> {
    return this.connectWallet().then(() => {
      console.log(
        `Connected to wallet at address: ${Address.parse(
          this.connector.wallet!.account.address
        ).toString()}\n`
      )
    })
  }

  address(): Address | undefined {
    if (!this.connector.wallet) return undefined

    return Address.parse(this.connector.wallet.account.address)
  }

  async connectWallet(tonProof?: string): Promise<ConnectWallet> {
    const wallets = (await this.connector.getWallets()).filter(isRemote)

    await this.connector.restoreConnection()

    const wallet = wallets[0]

    const url = this.connector.connect({
      universalLink: wallet.universalLink,
      bridgeUrl: wallet.bridgeUrl,
    }, { tonProof: tonProof })

    const checker = new Promise<Wallet>((resolve: (wallet: Wallet) => void, reject) => {
      this.connector.onStatusChange((w) => {
        if (w) {
          resolve(w)
        } else {
          reject('Wallet isn\'t connected')
        }
      }, reject)
    })

    return { url, checker }
  }

  disconnectWallet(): Promise<void> {
    return this.connector.disconnect()
  }

  removeSession(): Promise<void> {
    return this.storage.removeSession()
  }

  sendTransaction(
    address: Address,
    amount: bigint,
    payload?: Cell,
    stateInit?: StateInit
  ): Promise<void> {
    return this.connector.sendTransaction({
      validUntil: Date.now() + TRANSACTION_TIMEOUT,
      messages: [
        {
          address: address.toString(),
          amount: amount.toString(),
          payload: payload?.toBoc().toString('base64'),
          stateInit: stateInit
            ? beginCell()
                .storeWritable(storeStateInit(stateInit))
                .endCell()
                .toBoc()
                .toString('base64')
            : undefined,
        },
      ],
    }).then(() => {})
  }
}

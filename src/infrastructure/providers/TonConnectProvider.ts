import TonConnect, {
  IStorage,
  WalletInfo,
  WalletInfoRemote,
} from '@tonconnect/sdk'
import { Address, beginCell, Cell, StateInit, storeStateInit } from 'ton-core'
import { Storage } from '@src/infrastructure/storage/Storage'
import { SendProvider } from './SendProvider'

interface ConnectWallet {
  url: string
  checker: Promise<void>
}

class TonConnectStorage implements IStorage {
  #inner: Storage

  constructor(inner: Storage) {
    this.#inner = inner
  }

  async setItem(key: string, value: string): Promise<void> {
    return await this.#inner.setItem(key, value)
  }
  async getItem(key: string): Promise<string | null> {
    return await this.#inner.getItem(key)
  }
  async removeItem(key: string): Promise<void> {
    return await this.#inner.removeItem(key)
  }
}

function isRemote(walletInfo: WalletInfo): walletInfo is WalletInfoRemote {
  return 'universalLink' in walletInfo && 'bridgeUrl' in walletInfo
}

export class TonConnectProvider implements SendProvider {
  #connector: TonConnect

  constructor(storage: Storage) {
    this.#connector = new TonConnect({
      storage: new TonConnectStorage(storage),
      manifestUrl: 'https://jsonblob.com/api/jsonBlob/1086334593673740288',
    })
  }

  async connect(): Promise<void> {
    await this.connectWallet()

    console.log(
      `Connected to wallet at address: ${Address.parse(
        this.#connector.wallet!.account.address
      ).toString()}\n`
    )
  }

  address(): Address | undefined {
    if (!this.#connector.wallet) return undefined

    return Address.parse(this.#connector.wallet.account.address)
  }

  async connectWallet(): Promise<ConnectWallet> {
    const wallets = (await this.#connector.getWallets()).filter(isRemote)

    await this.#connector.restoreConnection()

    const wallet = wallets[0]

    const url = this.#connector.connect({
      universalLink: wallet.universalLink,
      bridgeUrl: wallet.bridgeUrl,
    })

    const checker = new Promise<void>((resolve, reject) => {
      this.#connector.onStatusChange((w) => {
        if (w) {
          resolve()
        } else {
          reject('Wallet is not connected')
        }
      }, reject)
    })

    return { url, checker }
  }

  async sendTransaction(
    address: Address,
    amount: bigint,
    payload?: Cell,
    stateInit?: StateInit
  ): Promise<void> {
    await this.#connector.sendTransaction({
      validUntil: Date.now() + 5 * 60 * 1000,
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
    })
  }
}
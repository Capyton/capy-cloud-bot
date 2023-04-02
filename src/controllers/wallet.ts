import { ConnectWallet, TonConnectProvider } from '@src/infrastructure/providers/ton-connect-provider'
import { Wallet, WalletAlreadyConnectedError } from '@tonconnect/sdk'

import { AuthPayload } from '@src/infrastructure/capy-cloud/schemas/api'

export class WalletController {
    constructor(
        public readonly provider: TonConnectProvider,
    ) { }

    getAddress(): string {
        const address = this.provider.address()

        if (!address) throw new Error('Wallet isn\'t connected')

        return address.toString()
    }

    getAddressFromWallet(wallet: Wallet): string {
        return wallet.account.address.toString()
    }

    connect(authPayload: AuthPayload): Promise<ConnectWallet> {
        return this.provider.connectWallet(authPayload.nonce)
    }

    disconnect(): Promise<void> {
        return this.provider.disconnectWallet()
    }

    removeSession(): Promise<void> {
        return this.provider.removeSession()
    }

    checkWalletAndAddress(wallet: ConnectWallet): Promise<{
        wallet: Wallet,
        address: string,
    }> {
        return wallet.checker
            .then((wallet: Wallet) => {
                const address = this.getAddressFromWallet(wallet)

                return { wallet, address }
            })
            .catch((err: WalletAlreadyConnectedError) => {
                throw err
            }
        )
    }
}

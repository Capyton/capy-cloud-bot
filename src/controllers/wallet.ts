import { ConnectWallet, TonConnectProvider } from "@src/infrastructure/providers/ton-connect-provider"
import { Wallet, WalletAlreadyConnectedError } from "@tonconnect/sdk"

import { AuthPayload } from "@src/infrastructure/capy-cloud/schemas/api"

export class WalletController {
    constructor(
        public readonly provider: TonConnectProvider,
    ) { }

    getAddress(): string {
        const address = this.provider.address()

        if (!address) throw new Error("Wallet isn't connected")

        return address.toString()
    }

    getAddressFromWallet(wallet: Wallet): string {
        return wallet.account.address.toString()
    }

    async connect(authPayload: AuthPayload): Promise<ConnectWallet> {
        return await this.provider.connectWallet(authPayload.nonce)
    }

    async disconnect(): Promise<void> {
        await this.provider.disconnectWallet()
    }

    async checkWalletAndAddress(wallet: ConnectWallet): Promise<{
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

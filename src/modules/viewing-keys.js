import { defineStore } from 'pinia'
import { assert } from '@stakeordie/griptape.js'
import { useWalletStore } from '@/modules/wallet'

const isEqual = (walletAddress, contractIdentifier) => {
  return vk => {
    return vk.walletAddress === walletAddress
        && ( vk.contractAddress === contractIdentifier || vk.contractId === contractIdentifier)
  }
}

export const useViewingKeyStore = defineStore({
  id: 'viewing-keys',

  // This enables to be peristed by the state perists layer.
  enablePersist: true,

  state: () => ({
    viewingKeys: []
  }),

  actions: {
    async createViewingKey(contractIdentifier) {
      const walletStore = useWalletStore()
      const walletAddress = walletStore.address

      const viewingKey = this.viewingKeys
        .find(isEqual(walletAddress, contractIdentifier))
      // If you have already a viewing key, do nothing
      if (viewingKey) {
        return
      }

      const contracts = Object.keys(this.contractsRegistry).map(c => this.contractsRegistry[c])
      const contractByAddress = this.contractsRegistry[contractIdentifier]
      const contract = contractByAddress ? contractByAddress : contracts.find(c => c.$id === contractIdentifier)
      assert(contract, 'contract not found')
      const contractSpec = contract.$state.spec
      const contractId = contract.$id
      const contractAddress = contract.contractAddress

      if (contractSpec === 'snip-20') {
        // TODO maybe we don't want to access the wallet directly.
        // Suggest the token to keplr.
        await this.wallet.suggestToken(contractAddress)

        // Get the key from keplr if any.
        let key = await this.wallet.getSnip20ViewingKey(contractAddress)

        if (!key) {
          const response = await contract.createViewingKey()
          key = response.create_viewing_key.key
        }

        // Update state
        this.$patch((state) => {
          state.viewingKeys.push({ walletAddress, contractAddress, key, contractId })
        })

      } else {
        const response = await contract.createViewingKey()
        const result = response.parse()

        const [response_key] = Object.keys(result)

        let key = result?.[response_key].key

        // Update state
        this.$patch((state) => {
          state.viewingKeys.push({ walletAddress, contractAddress, key, contractId })
        })
      }
    },

    deleteViewingKey(contractIdentifier) {
      const wallet = useWalletStore()

      const idx = this.viewingKeys
        .findIndex(isEqual(wallet.address, contractIdentifier))

      if (idx === -1) return

      this.$patch((state) => {
        state.viewingKeys.splice(idx, 1)
      })
    },

    getViewingKey(contractIdentifier) {
      const wallet = useWalletStore()
      const vk = this.viewingKeys
        .find(isEqual(wallet.address, contractIdentifier))
      return vk?.key
    }
  }
})

import { useWallet } from '@solana/wallet-adapter-react'
import { AsyncButton } from 'common/Button'
import { Header } from 'common/Header'
import { notify } from 'common/Notification'
import { tryPublicKey } from 'common/utils'
import type { NextPage } from 'next'
import Image from 'next/image'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { HydraWalletInitParams, useHydraContext } from 'providers/HydraProvider'
import { useState } from 'react'
import styles from '../../styles/Home.module.css'

const Home: NextPage = () => {
  const { hydraWallet, createHydraWallet } = useHydraContext()

  const [walletName, setWalletName] = useState<undefined | string>(undefined)
  const [hydraWalletMembers, setHydraWalletMembers] = useState<
    { memberKey?: string; shares?: number }[]
  >([{ memberKey: undefined, shares: undefined }])

  const validateAndCreateWallet = async () => {
    try {
      if (!walletName) {
        throw 'Specify a wallet name'
      }
      if (walletName.includes(' ')) {
        throw 'Wallet name cannot contain spaces'
      }
      let shareSum = 0
      for (const member of hydraWalletMembers) {
        if (!member.memberKey) {
          throw 'Please specify all member public keys'
        }
        if (!member.shares) {
          throw 'Please specify all member shares'
        }
        const memberPubkey = tryPublicKey(member.memberKey)
        if (!memberPubkey) {
          throw 'Invalid member public key, unable to cast to PublicKey'
        }
        shareSum += member.shares
      }
      if (shareSum !== 100) {
        throw 'Sum of all shares must equal 100'
      }
      if (!hydraWalletMembers || hydraWalletMembers.length == 0) {
        throw 'Please specify at least one member'
      }

      const params: HydraWalletInitParams = {
        walletName,
        members: [
          ...hydraWalletMembers.map((member) => ({
            publicKey: tryPublicKey(member.memberKey)!,
            shares: member.shares!,
          })),
        ],
      }

      await createHydraWallet(params)
    } catch (e) {
      notify({ message: `Error creating hydra wallet: ${e}`, type: 'error' })
    }
  }

  return (
    <div className="bg-white h-screen max-h-screen">
      <Header />

      <main className="h-[90%] py-16 flex flex-1 flex-col justify-center items-center">
        {hydraWallet && (
          <div className="text-gray-700 bg-green-300 w-full max-w-lg text-center py-3 mb-10">
            <p className="font-bold uppercase tracking-wide">
              Hydra Wallet Created
            </p>
            <p>
              {' '}
              Access the wallet at{' '}
              <a href={`/wallet/${hydraWallet.walletName}`}>
                localhost:3000/
                {hydraWallet ? hydraWallet.walletName : null}
              </a>
            </p>
          </div>
        )}
        <form className="w-full max-w-lg">
          <div className="w-full mb-6">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="grid-first-name"
            >
              Hydra Wallet Name
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              name="grid-first-name"
              type="text"
              placeholder="cardinal-wallet"
              onChange={(e) => {
                setWalletName(e.target.value)
              }}
              value={walletName}
            />
          </div>
          <div className="flex flex-wrap mb-6">
            <div className="w-full md:w-4/5 pr-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Wallet Address
              </label>
              {hydraWalletMembers &&
                hydraWalletMembers.map((member, i) => {
                  return (
                    <input
                      key={i}
                      name="memberKey"
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                      id="grid-first-name"
                      type="text"
                      placeholder="Cmw...4xW"
                      onChange={(e) => {
                        const walletMembers = hydraWalletMembers
                        walletMembers[i]!.memberKey = e.target.value
                        setHydraWalletMembers([...walletMembers])
                      }}
                      value={member.memberKey}
                    />
                  )
                })}
            </div>
            <div className="w-full md:w-1/5">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Shares / 100
              </label>
              {hydraWalletMembers.map((member, i) => {
                return (
                  <div className="flex flex-row" key={`share-${i}`}>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                      id="grid-last-name"
                      type="text"
                      placeholder="10"
                      onChange={(e) => {
                        const walletMembers = hydraWalletMembers
                        walletMembers[i]!.shares = parseInt(e.target.value)
                        setHydraWalletMembers([...walletMembers])
                      }}
                      value={member.shares}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <button
                type="button"
                className="bg-gray-200 text-gray-600 hover:bg-gray-300 px-4 py-3 rounded-md mr-3"
                onClick={() =>
                  setHydraWalletMembers([
                    ...hydraWalletMembers,
                    {
                      memberKey: undefined,
                      shares: undefined,
                    },
                  ])
                }
              >
                Add Member
              </button>
              <button
                type="button"
                className="bg-gray-200 text-gray-600 hover:bg-gray-300 px-4 py-3 rounded-md "
                onClick={() =>
                  setHydraWalletMembers(
                    hydraWalletMembers.filter(
                      (item, index) => index !== hydraWalletMembers.length - 1
                    )
                  )
                }
              >
                Remove Member
              </button>
            </div>
            <div>
              <AsyncButton
                type="button"
                bgColor="rgb(96 165 250)"
                variant="primary"
                className="bg-blue-400 text-white hover:bg-blue-500 px-4 py-3 rounded-md"
                handleClick={async () => validateAndCreateWallet()}
              >
                Create Hydra Wallet
              </AsyncButton>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Home
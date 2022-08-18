import { useEffect, useState } from "react"
import { ethers } from 'ethers'
import myContract from './myNft.json'
import { CircleNotch } from "phosphor-react"
import img from './assets/illiou.png'

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [nftsMinted, setNftsMinted] = useState<number>(0)
  const [openseaLink, setOpenseaLink] = useState<string>('')
  const [isMinting, setIsMinting] = useState<boolean>(false)
  const [isLoading, setIsLoading]= useState<boolean>(false)

  const CONTRACT_ADDRESS = "0x9b22b2A0C37c0B2C7f88BbF1beCa3Dfd371025dA"

  async function askContractToMint() {
    try {
      const { ethereum } = window

      if (ethereum) {
        setIsLoading(true)
        const provider = new ethers.providers.Web3Provider(ethereum)

        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myContract.abi,
          signer
        )

        console.log("Vai abrir a carteira agora para pagar o gás...")

       
        let nftTxn = await connectedContract.makeAnNFT()
        setIsLoading(false)
        setIsMinting(true)
        console.log("Cunhando...")

        await nftTxn.wait()
        console.log(`Cunhado, veja a transação: https://goerli.etherscan.io/tx/${nftTxn.hash}`)

        let nftsMintedAmount = await connectedContract.getNumberOfNftMinted()
        console.log("NFTS MINTED", nftsMintedAmount)
        setNftsMinted(nftsMintedAmount)
        setIsMinting(false)

      } else {
        console.log("Ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function setupEventListener() {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myContract.abi, signer)

        connectedContract.on("newNftMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())

          setOpenseaLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
      }

    } catch (error) {
      console.log(error)
    }
  }

  async function getNumberOfNftsMinted() {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myContract.abi, signer)

        let nftsMintedAmount = await connectedContract.getNumberOfNftMinted()
        console.log("NFTS MINTED", nftsMintedAmount.toNumber())
        setNftsMinted(nftsMintedAmount.toNumber())
      }

    } catch (error) {
      console.log(error)
    }
  }

  async function handleConnectWallet() {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Baixe a metamask!')
        return
      }

      if (ethereum.request) {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        })
  
        setIsConnected(true)
        console.log("Conectado", accounts[0])
  
        setupEventListener()
      }
      
    } catch (error) {
      console.log(error)
    }
  }
  
  async function verifyWalletChain() {
    try {
      const { ethereum } = window

      if (ethereum && ethereum.request) {
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Conectado à rede " + chainId);
        // String, hex code of the chainId of the Rinkebey test network
        const goerliChainId = "0x5"; 
        if (chainId !== goerliChainId) {
          alert("Você não está conectado a rede Goerli de teste!");
        }
      } else {
        console.log("Ethereum não encontrado!")
      }
      
    } catch (error) {
      console.log(error)
    } 
  }

  async function checkIfWalletIsConnected() {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Carteira não está conectada")
      return
    } else {
      console.log("Ethreum: ", ethereum)
    }

    if (ethereum.request) {
      const accounts = await ethereum.request({ method: "eth_accounts" })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log("Conta autorizada!")
  
        setIsConnected(true)
        setupEventListener()
      } else {
        console.log("Nenhuma conta autorizada!")
      }
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    verifyWalletChain()
    getNumberOfNftsMinted()
  }, [nftsMinted, isConnected])

  return (
    <div className="w-screen h-screen">
      <div className="max-w-[1060px] flex justify-center mx-auto pt-24">
        <div>
          <h1 className="text-[60px] font-bold text-orange-600 text-center">Descubra seu NFT hoje!</h1>

          {!isConnected && (
            <button 
              type="button" 
              onClick={handleConnectWallet} 
              className="font-bold mt-16 w-10/12 md:w-full md:max-w-[720px] mx-auto flex items-center text-center justify-center gap-x-2 bg-orange-500 border-0 text-black px-2 py-4 rounded-xl hover:bg-orange-700 transtion duration-500"
            >
              Conectar Carteira
            </button>
          )}

          {isConnected && (
            <div className="h-contain w-[760px] bg-zinc-800 px-24 py-12 rounded-xl flex-col ">
              <div>
                <img src={img} alt="" className="mx-auto"/>
                <button 
                  disabled={nftsMinted >= 50}
                  type="button" 
                  onClick={askContractToMint}
                  className="font-bold mt-16 max-w-[720px] w-full flex items-center text-center justify-center gap-x-2 bg-orange-500 border-0 text-black px-2 py-4 rounded-xl hover:bg-orange-700 transtion duration-500"
                  >
                    {isMinting && !isLoading &&
                      <>
                        <span>Minting...</span>
                        <CircleNotch size={24} className="animate-spin"/>
                      </>
                    }
                    {isLoading &&
                      <>
                        <span>Aguardando assinatura...</span>
                        <CircleNotch size={24} className="animate-spin"/>
                      </>
                    }
                    {!isLoading && !isMinting && 
                      <span>Mint NFT {`(Minted : ${nftsMinted}/50)`}</span>
                    }
                    {nftsMinted >= 50 && 
                      <span>All NFTs were minted {`(Minted : ${nftsMinted}/50)`}</span>
                    }
                </button>
              </div>
            </div>
          )}

          {openseaLink !== '' && 
            <div className="mt-12">
              <a 
                target="_blank"
                className="font-bold hover:text-orange-500 transition duration-300 text-xl"
                href={openseaLink}
              >
                Ver no opensea
              </a>
            </div>
          }
        </div>

      </div>
    </div>
  )
}

export default App

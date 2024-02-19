import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "@/components/studio/tabs.js";
import React from 'react'
import NextHead from 'next/head'

import { AppLayout, Loading, ErrorPage, StudioHeader } from '@/components/ui'
import NFTEdit from "./edit";
import { auth } from 'auth'

import { useNFT } from '@/hooks'
import prisma from '@/lib/prisma'
import NFTPreview from "./preview";
import { NFTCaption } from "@/components/studio";


export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			}
		}
	}

	const { csn, anchor } = context.query

	let nft = await prisma.NFT.findFirst({
		where: {
			anchor: anchor,
			contract: {
				csn: {
					equals: csn,
					mode: "insensitive"
				},
				ownerId: session.wallet.id
			}
		},
		include: {
			contract: true,
		}
	})

	if (!nft) {
		return {
			props: {
				forbidden: true
			}
		}
	}

	const wallet = { id: session.wallet.id, address: session.wallet.address?.toLowerCase() }

	const contract = JSON.parse(JSON.stringify(nft.contract))

	return {
		props: {
			anchor,
			wallet,
			contract
		}
	}
}

function NftTabs() {
  return (
    <div className="wrapper">
      <Tabs>
        <TabList aria-label="NFT-Details">
          <Tab to="/">EDIT</Tab>
          <Tab to="/preview">PREVIEW</Tab>
        </TabList>
        <div className="panels">
          <TabPanel>
            <Outlet />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}


const NFTOverview = ({ contract, wallet, anchor, ...props }) => {
	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}

	const { nft, isLoading, error, mutate } = useNFT({csn: contract.csn, anchor: anchor})
	const nftCaption = nft ? nft.slid == 0 ? 'Default NFT' : nft.slid : anchor


	return (
        <>
        <NextHead>
            <title>DigitalSoul - Studio - {nftCaption} </title>
        </NextHead>

        <AppLayout wallet={wallet} contractId={contract.id}>
            <div className="page w-full ">
            <StudioHeader title={`${nftCaption}`}
											contract={contract} nft={nft}
											staticCaption={nftCaption} />
                <main className="flex flex-col mt-3 ml-12">
                    {nft ? (
                        <MemoryRouter>
							<Routes>
							<Route path="/" element={<NftTabs />}>
								<Route path="/preview"  element={<NFTPreview contract={contract} anchor={anchor} wallet={wallet} />} />
								<Route index element={<NFTEdit contract={contract} anchor={anchor} wallet={wallet} />} />
							</Route>
							</Routes>
                      </MemoryRouter>
                    ) : (
                        <div className='text-center'>
                            <Loading size='lg' />
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
        </>
	)
}

export default NFTOverview;


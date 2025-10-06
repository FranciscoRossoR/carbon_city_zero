import { observer } from "mobx-react"
import Head from "next/head"
import React from "react"

import gameState from 'src/store/store'
import { Flex } from "@chakra-ui/react"
import HeadingPanel from "src/components/layout/HeadingPanel"
import SummaryPanel from "src/components/layout/SummaryPanel"
import MarketPanel from "src/components/layout/MarketPanel"
import DrawPanel from "src/components/layout/DrawPanel"
import SearchPanel from "src/components/layout/SearchPanel"

export default observer(class Play extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props)
    }

    public render() {
        return (
            <>
                <Head>
                    <title>Carbon City Zero</title>
                    <meta name="description" content="Carbon City Zero" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <HeadingPanel flex="1 1 100%" />
                {gameState.status === "playing" ?
                    <Flex justifyContent="center" align="stretch" wrap="wrap">
                        <MarketPanel flex="0 1 100% " />
                        <DrawPanel flex="0 1 100%" />
                        <SearchPanel flex="0 1 100%" />
                    </Flex>
                : null}
                <SummaryPanel />
            </>
        )
    }

})
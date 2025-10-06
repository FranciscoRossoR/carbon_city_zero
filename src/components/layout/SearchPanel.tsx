import { Box, Center, FlexProps, Heading, HStack, Spacer } from "@chakra-ui/react";
import { observer } from "mobx-react";
import gameState, { callUpdateGlobalSlot, callUpdateLandfillPile, callUpdateMarketDeck, callUpdatePlayers } from "src/store/store";
import React from "react";
import PlayingCard from "../PlayingCard";
import { Search } from "src/entities/carboncityzero/carbonCityZeroPlayer";
import { CarbonCityZeroCard, Sector } from "src/entities/carboncityzero/carbonCityZeroCard";
import CardHolder from "framework/entities/cardholder";
import { reaction } from "mobx";

type ISearchPanelProps = {
} & FlexProps

export default observer(class SearchPanel extends React.Component<ISearchPanelProps, {}> {

    public constructor(props: ISearchPanelProps) {
        super(props)
    }

    public render() {

        const player = gameState.currentPlayer
        const playerSearch = player.search
        let searchPile: CardHolder<CarbonCityZeroCard> | undefined
        let searchName: string | undefined
        switch(playerSearch) {
            case Search.LandfillPile: {
                searchPile = gameState.landfillPile
                searchName = "Landfill Pile"
                break
            }
            case Search.RecyclePile: {
                searchPile = player.recyclePile
                searchName = "Recycle Pile"
                break
            }
            case Search.DrawDeck:  {
                searchPile = player.drawDeck
                searchName = "Draw Deck"
                break
            }
            case Search.MarketDeckGlobal: {
                searchPile = gameState.marketDeck
                searchName = "Market Deck"
                break
            }
        }

        if (playerSearch != Search.None && searchPile && searchName) {
            return(
                <Box {...this.props} p="1em" bgColor="brand.300">
    
                    <Heading>{searchName}</Heading>
    
                    <Center>
                        <HStack p="1em" spacing="0">
                            {searchPile.cards.map((c, i) => {
                                const drawDeckSearch =
                                    player.search === Search.DrawDeck
                                const marketDeckSearchGlobal =
                                    player.search === Search.MarketDeckGlobal &&
                                    c.sector === Sector.Global
                                const interactable = drawDeckSearch || marketDeckSearchGlobal
                                const handleCardClick = () => {
                                    if (drawDeckSearch) {
                                        c.playFromDrawDeck()
                                        callUpdatePlayers(gameState.players)
                                    } else if (marketDeckSearchGlobal) {
                                        c.playGlobalFromMarketDeck()
                                        callUpdateMarketDeck(gameState.marketDeck)
                                        callUpdateGlobalSlot(gameState.globalSlot)
                                        callUpdateLandfillPile(gameState.landfillPile)
                                    }
                                }
                                return (
                                    <React.Fragment key={c._uid}>
                                        <Spacer w="1em" />
                                        <PlayingCard
                                            {...c}
                                            interactable={interactable}
                                            onClick={handleCardClick}
                                        />
                                    </React.Fragment>
                                )
                            })}
                        </HStack>
                    </Center>

                </Box>
            )
        }

    }

})

reaction(
    () => gameState.currentPlayer?.search,
    (search, previousSearch) => {
        if (previousSearch !== Search.None) {
            switch (previousSearch) {
                case Search.DrawDeck:
                    gameState.currentPlayer.drawDeck.shuffle()
                    break
                case Search.MarketDeckGlobal:
                    gameState.marketDeck.shuffle()
                    break
            }
        }
    }
)
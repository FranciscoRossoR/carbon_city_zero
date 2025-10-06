import { Badge, Box, Button, Center, FlexProps, HStack, Spacer } from "@chakra-ui/react"
import { reaction } from "mobx"
import { observer } from "mobx-react"
import gameState, { callUpdateLandfillPile, callUpdatePlayers, callUpdateWinner } from "pages/store"
import React from "react"
import PlayingCard from 'src/components/PlayingCard'
import { SpecialRule } from "src/entities/carboncityzero/carbonCityZeroCard"
import CarbonCityZeroPlayer, { Search, Status } from "src/entities/carboncityzero/carbonCityZeroPlayer"

type IDrawPanelProps = {
} & FlexProps

export default observer (class DrawPanel extends React.Component<IDrawPanelProps, {}> {

    public constructor(props: IDrawPanelProps) {
        super(props)
    }

    public render() {

        // Player
        const currentPlayer = gameState.currentPlayer as CarbonCityZeroPlayer
        // Draw Deck
        const drawDeck = currentPlayer.drawDeck
        const drawDeckSize = drawDeck.size
        const drawDeckCard = drawDeck.head
        // Drawn Cards
        const drawnCards = currentPlayer.drawnCards
        const actions = gameState.availableActions
        // Recycle Pile
        const recyclePile = currentPlayer.recyclePile
        const recyclePileSize = recyclePile.size
        const recyclePileCard = recyclePile.head

        const deckWidth = '140px'
        const deckStyle = {
            borderBottom: '5px double',
            borderRight: '5px double',
            width: deckWidth
        }
        const badgeStyle = {
            borderRadius: '50%',
            w: '2.5em',
            lineHeight: '2.5em',
            textAlign: 'center',
            position: 'absolute',
            bottom: '-1.25em',
            backgroundColor: '#fff',
            right: '-1.25em'
        }
        const actionButtonStyle = {
            bg: 'brand.500',
            _hover: {
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
            }
        }
        
        const action = actions.at(0)

        const player = gameState.currentPlayer

        const handleRecyclePileClick = () => {
            player.search == Search.RecyclePile ?
                player.setSearch(Search.None) :
                player.setSearch(Search.RecyclePile)
        }

        return (
            <Box {...this.props} p="1em">
                <Center>
                    <HStack>
                        <Box m="1em" position="relative" w={deckWidth}>
                            <PlayingCard
                                sx={deckStyle}
                                backgroundColor={'blue.500'}
                            />
                            <Badge
                                variant="outline"
                                colorScheme="brand"
                                sx={badgeStyle}>
                                    {drawDeckSize}
                            </Badge>
                        </Box>
                        <Center w='10em'>
                            {action ?
                            <Button
                                key={action.actionName}
                                sx={actionButtonStyle}
                                m="1em" onClick={() => {
                                    gameState.executeAction(action)
                                    callUpdatePlayers(gameState.players)
                                    if (gameState.winner) callUpdateWinner(gameState.winner)
                                    }}>
                                    {action.actionName}
                            </Button>
                            : null}
                        </Center>
                        <HStack p="1em" spacing="0">
                            {drawnCards.cards.map((c, i) => {
                                const canActivate =
                                    (
                                        c.specialRule &&
                                        c.specialRule != SpecialRule.AnnulLinkAbilities &&
                                        !c.hasActivated &&
                                        player.status != Status.LandfillMarketCard &&
                                        gameState.phase === "activating"
                                    ) ||
                                    player.status === Status.LandfillDrawnCard
                                const handleCardClick = () => {
                                    if (canActivate) {
                                        if (player.status === Status.LandfillDrawnCard){
                                            c.landfillDrawnCard()
                                            callUpdateLandfillPile(gameState.landfillPile)
                                        } else {
                                            c.activate()
                                        }
                                        callUpdatePlayers(gameState.players)
                                    }
                                }
                                return (
                                    <React.Fragment key={c._uid}>
                                        <Spacer w="1em" />
                                        <PlayingCard
                                            {...c}
                                            interactable={canActivate}
                                            onClick={handleCardClick}
                                        />
                                    </React.Fragment>
                                )
                            })}
                        </HStack>
                        <Box
                            m="1em"
                            position="relative" 
                            w={deckWidth}
                            onClick={handleRecyclePileClick}
                            cursor="pointer"
                            _hover={{
                                transform: 'translateY(-2px)',
                                boxShadow: 'lg'
                            }}
                        >
                            <PlayingCard
                                {...recyclePileCard}
                                color="gray.500"/>
                            <Badge
                                variant="outline"
                                colorScheme="brand"
                                sx={badgeStyle}>
                                    {recyclePileSize}
                            </Badge>
                        </Box>
                    </HStack>
                </Center>
            </Box>
        )

    }

})

reaction(
    () => gameState.turn,
    () => {
        gameState.currentPlayer.drawCards(gameState.playerDrawAmount)
})
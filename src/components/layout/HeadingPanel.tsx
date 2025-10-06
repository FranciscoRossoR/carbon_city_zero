import { FlexProps, Heading, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react";
import gameState from "src/store/store";
import React from "react";

type IHeadingProps = {} & FlexProps;

export default observer(class HeadingPanel extends React.Component<IHeadingProps, {}> {

    public constructor(props: IHeadingProps) {
        super(props);
    }

    public render() {

        const currentPlayer = gameState.currentPlayer

        return (
            <VStack>
                {(gameState.status === "open") ?
                    <>
                        <Heading>Waiting for players</Heading>
                    </>
                : null}
                {(gameState.status === "playing") ?
                    (gameState.players.length === 1) ?
                        <>
                            <Heading>Remaining Turns: {gameState.counter}</Heading>
                        </>
                    :
                    <>
                        <Heading>{currentPlayer.name}</Heading>
                    </>
                : null} 
                {(gameState.status === "finished") ?
                    (gameState.counter < 1 && gameState.currentPlayer.carbon > 0) ?
                        <>
                            <Heading>Game lost</Heading>
                        </>
                    :
                    <>
                        <Heading>Game finished</Heading>
                        <Text>Winner: {gameState.winner?.name}</Text>
                    </>
                : null}
            </VStack>
        )

    }

})
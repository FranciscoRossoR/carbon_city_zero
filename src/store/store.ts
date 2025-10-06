import { io } from 'socket.io-client';
import GameState, { GameStatus } from "framework/entities/gameState";
import Player from "framework/entities/player";
import CarbonCityZeroPlayer from "src/entities/carboncityzero/carbonCityZeroPlayer";
import CarbonCityZeroState, { Phase } from "src/entities/carboncityzero/carbonCityZeroState";
import CardHolder from 'framework/entities/cardholder';
import { CarbonCityZeroCard } from 'src/entities/carboncityzero/carbonCityZeroCard';
import OrderedCardHolder from 'framework/entities/orderedcardholder';


// Manage connection

const socket = io('http://localhost:8080')
socket.on('connect', () => {
    // Report connection
    console.log(`You connected with id: ${socket.id}`)
    // Load to the server the update types that will be called
    const updateTypes = new Map()
    updateTypes 
        .set('callUpdatePlayers', 'updatePlayers')
        .set('callUpdateTurn', 'updateTurn')
        .set('callUpdateStatus', 'updateStatus')
        .set('callUpdatePhase', 'updatePhase')
        .set('callUpdateMarketSize', 'updateMarketSize')
        .set('callUpdateMarketDeck', 'updateMarketDeck')
        .set('callUpdateMarketplace', 'updateMarketplace')
        .set('callUpdateLandfillPile', 'updateLandfillPile')
        .set('callUpdateGlobalSlot', 'updateGlobalSlot')
        .set('callUpdateWinner', 'updateWinner')
    socket.emit('loadUpdateTypes', Object.fromEntries(updateTypes))
})

// Export state

var gameState = new CarbonCityZeroState()
export default gameState


// Sync call functions

function callUpdate(name: String, update: any) {
    socket.emit('callUpdate', name, update)
}

export function callUpdatePlayers(emittedPlayers: Player[]) {
    callUpdate('callUpdatePlayers', emittedPlayers)
}

export function callUpdateTurn(emittedTurn: number) {
    callUpdate('callUpdateTurn', emittedTurn)
}

export function callUpdateStatus(emittedStatus: GameStatus) {
    callUpdate('callUpdateStatus', emittedStatus)
}

export function callUpdatePhase(emittedPhase: Phase) {
    callUpdate('callUpdatePhase', emittedPhase)
}

export function callUpdateMarketSize(emittedMarketSize: number) {
    callUpdate('callUpdateMarketSize', emittedMarketSize)
}

export function callUpdateMarketDeck(emittedMarketDeck: CardHolder<CarbonCityZeroCard>) {
    callUpdate('callUpdateMarketDeck', emittedMarketDeck)
}

export function callUpdateMarketplace(emittedMarketplace: CardHolder<CarbonCityZeroCard>) {
    callUpdate('callUpdateMarketplace', emittedMarketplace)
}

export function callUpdateLandfillPile(emittedLandfillPile: CardHolder<CarbonCityZeroCard>) {
    callUpdate('callUpdateLandfillPile', emittedLandfillPile)
}

export function callUpdateGlobalSlot(emittedGlobalSlot: CardHolder<CarbonCityZeroCard>) {
    callUpdate('callUpdateGlobalSlot', emittedGlobalSlot)
}

export function callUpdateWinner(emittedWinner: CarbonCityZeroPlayer) {
    callUpdate('callUpdateWinner', emittedWinner)
}

// Sync get functions

socket.on('updatePlayers', newPlayers => {
    const players = newPlayers.map((playerData: any) => {
        // Create player and set name
        const player = new CarbonCityZeroPlayer(playerData.name)
        // Set color
        player.setColor(playerData.color)
        // Set Draw Deck
        const drawDeck = new CardHolder<CarbonCityZeroCard>()
        for (const c of playerData.drawDeck.cards) {
            const newCard = new CarbonCityZeroCard(
                c.name,
                c.cost,
                c.income,
                c.carbon,
                c.sector,
                c.specialRule,
                c.linkAbility
            )
            drawDeck.addCard(newCard)
        }
        player.setDrawDeck(drawDeck)
        // Set Drawn Cards
        const drawnCards = new CardHolder<CarbonCityZeroCard>()
        for (const c of playerData.drawnCards.cards) {
            const newCard = new CarbonCityZeroCard(
                c.name,
                c.cost,
                c.income,
                c.carbon,
                c.sector,
                c.specialRule,
                c.linkAbility,
                c.hasActivated
            )
            drawnCards.addCard(newCard)
        }
        player.setDrawnCards(drawnCards)
        // Set Recycle Pile
        const recyclePile = new CardHolder<CarbonCityZeroCard>()
        for (const c of playerData.recyclePile.cards) {
            const newCard = new CarbonCityZeroCard(
                c.name,
                c.cost,
                c.income,
                c.carbon,
                c.sector,
                c.specialRule,
                c.linkAbility
            )
            recyclePile.addCard(newCard)
        }
        player.setRecyclePile(recyclePile)
        // Set income, carbon, factoriesIncreaseCarbon, status, buyToTop, search
        player.setIncome(playerData.income)
        player.setCarbon(playerData.carbon)
        player.setFactoriesIncreaseCarbon(playerData.factoriesIncreaseCarbon)
        player.setStatus(playerData.status)
        player.setBuyToTop(playerData.buyToTop)
        player.setSearch(playerData.search)
        // Return the new player
        return player
    })
    gameState.setPlayers(players)
})

socket.on('updateTurn', newTurn => {
    gameState.setTurn(newTurn)
})

socket.on('updateStatus', newStatus => {
    gameState.setStatus(newStatus)
})

socket.on('updatePhase', newPhase => {
    gameState.setPhase(newPhase)
})

socket.on('updateMarketSize', newMarketSize => {
    gameState.setMarketSize(newMarketSize)
})

socket.on('updateMarketDeck', newMarketDeck => {
    const marketDeck = new CardHolder<CarbonCityZeroCard>()
    for (const c of newMarketDeck.cards) {
        const newCard = new CarbonCityZeroCard(
            c.name,
            c.cost,
            c.income,
            c.carbon,
            c.sector,
            c.specialRule,
            c.linkAbility
        )
        marketDeck.addCard(newCard)
    }
    gameState.setMarketDeck(marketDeck)
})

socket.on('updateMarketplace', newMarketplace => {
    const marketplace = new CardHolder<CarbonCityZeroCard>()
    for (const c of newMarketplace.cards) {
        const newCard = new CarbonCityZeroCard(
            c.name,
            c.cost,
            c.income,
            c.carbon,
            c.sector,
            c.specialRule,
            c.linkAbility
        )
        marketplace.addCard(newCard)
    }
    gameState.setMarketplace(marketplace)
})

socket.on('updateLandfillPile', newLandfillPile => {
    const landfillPile = new CardHolder<CarbonCityZeroCard>()
    for (const c of newLandfillPile.cards) {
        const newCard = new CarbonCityZeroCard(
            c.name,
            c.cost,
            c.income,
            c.carbon,
            c.sector,
            c.specialRule,
            c.linkAbility
        )
        landfillPile.addCard(newCard)
    }
    gameState.setLandfillPile(landfillPile)
})

socket.on('updateGlobalSlot', newGlobalSlot => {
    const globalSlot = new CardHolder<CarbonCityZeroCard>()
    for (const c of newGlobalSlot.cards) {
        const newCard = new CarbonCityZeroCard(
            c.name,
            c.cost,
            c.income,
            c.carbon,
            c.sector,
            c.specialRule,
            c.linkAbility
        )
        globalSlot.addCard(newCard)
    }
    gameState.setGlobalSlot(globalSlot)
})

socket.on('updateWinner', newWinner => {
    gameState.setWinner(newWinner)
})
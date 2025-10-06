import CardHolder from "framework/entities/cardholder";
import GameAction from "framework/entities/gameAction";
import GameState, { GameStatus } from "framework/entities/gameState";
import CarbonCityZeroPlayer, { Search, Status } from "./carbonCityZeroPlayer";
import UniqueGameElement from "framework/entities/gameElement";
import ComplexityAnalyst from "framework/entities/complexityAnalyst";
import { action, computed, makeObservable, observable, override } from "mobx";
import { BuyAction, PassAction, ReadyAction } from "./actions";
import { CarbonCityZeroCard, LinkAbility, Sector, SpecialRule } from "./carbonCityZeroCard";
import { callUpdateMarketDeck } from "src/store/store";

export type Phase = "ready" | "activating" | "buying"

export default class CarbonCityZeroState extends GameState {

    marketDeck: CardHolder<CarbonCityZeroCard>
    marketplace: CardHolder<CarbonCityZeroCard>
    landfillPile: CardHolder<CarbonCityZeroCard>
    globalSlot: CardHolder<CarbonCityZeroCard>
    marketSize: number
    playerDrawAmount: number
    turn: number
    phase: Phase
    winner: CarbonCityZeroPlayer | undefined
    counter: number

    public constructor(players?: CarbonCityZeroPlayer[], gameElements?: UniqueGameElement[], status?: GameStatus, complexAnalyst?: ComplexityAnalyst) {
        gameElements = []
        super(1, 4, players ? players : [], gameElements, status, complexAnalyst)
        this.marketDeck = gameStartingDeck
        this.marketDeck.shuffle()
        this.marketplace = new CardHolder<CarbonCityZeroCard>()
        this.landfillPile = new CardHolder<CarbonCityZeroCard>()
        this.globalSlot = new CardHolder<CarbonCityZeroCard>
        this.marketSize = 5
        this.playerDrawAmount = 5
        this.turn = -1
        this.phase = "ready"
        this.winner = undefined
        this.counter = 10
        makeObservable(this, {
            availableActions: override,
            status: override,
            gameElements: override,
            history: override,
            marketDeck: observable,
            marketplace: observable,
            landfillPile: observable,
            globalSlot: observable,
            marketSize: observable,
            playerDrawAmount: observable,
            turn: observable,
            phase: observable,
            winner: observable,
            currentPlayer: computed,
            winGame: action,
            setWinner: action,
            getReady: action,
            passTurn: action,
            goToBuyPhase: action,
            setMarketSize: action,
            setPlayerDrawAmount: action,
            addPlayer: action,
            setPlayers: action,
            setStatus: action,
            setTurn: action,
            setPhase: action,
            setMarketDeck: action,
            setMarketplace: action,
            setLandfillPile: action,
            setGlobalSlot: action
        })
        callUpdateMarketDeck(this.marketDeck)
    }

    public setWinner(winner: CarbonCityZeroPlayer) {
        this.winner = winner
    }

    public getPlayer(index: number): CarbonCityZeroPlayer {
        return <CarbonCityZeroPlayer> this.players[index]
    }

    public get currentPlayer(): CarbonCityZeroPlayer {
        return this.getPlayer(this.turn)
    }

    protected computeAvailableActions(): GameAction[] {
        const res: GameAction[] = []
        if (this.status === "playing") {
            switch (this.phase) {
                case "ready":
                    res.push(new ReadyAction())
                    break
                case "activating":
                    res.push(new BuyAction())
                    break
                case "buying":
                    res.push(new PassAction())
                    break
            }
        }
        return res
    }

    public passTurn(): CarbonCityZeroState {
        this.turn ++
        if (this.turn >= this.players.length) {
            this.turn = 0
        }
        this.phase = "activating"
        if (this.players.length === 1) {
            this.counter -= 1
            if (this.counter < 1) this.setStatus("finished")
            this.currentPlayer.drawCards(this.playerDrawAmount)
        }
        return this
    }

    public getReady(): CarbonCityZeroState {
        this.phase = "activating"
        return this
    }

    public goToBuyPhase(): CarbonCityZeroState {
        this.phase = "buying"
        let player = this.currentPlayer
        player.setIncome(player.getTotalIncome())
        player.setStatus(Status.Regular)
        player.setSearch(Search.None)
        return this
    }

    public startGame() : boolean {
        if (this.status === "open" && this.enoughPlayers) {
            while (this.marketplace.size < this.marketSize) {
                this.drawCards(this.marketSize-this.marketplace.size)
            }
            this.turn = 0
            this.status = "playing"
            return true
        } else {
            return false
        }
    }

    public drawCards(amount: number) {
        for (let i = 0 ; i < amount ; i ++) {
            // Check if Market Deck is empty
            if (this.marketDeck.size == 0) {
                // Move Landfill Pile into Market Deck
                let landfill = this.landfillPile
                while (landfill.size > 0) {
                    landfill.moveCard(landfill.head, this.marketDeck)
                }
                // Shuffle Market Deck
                this.marketDeck.shuffle()
            }
            // Draw card
            const card = this.marketDeck.head
            const sector = card.sector
            const player = this.currentPlayer
            let target: CardHolder<CarbonCityZeroCard>
            if (sector === Sector.Snag) {
                if (this.phase === "ready") {
                    target = this.landfillPile
                } else {
                    target = player.recyclePile
                }
            } else if (sector === Sector.Global) {
                if (this.globalSlot.size > 0) {
                    this.globalSlot.moveCard(this.globalSlot.head, this.landfillPile)
                }
                target = this.globalSlot
            } else {
                target = this.marketplace
            }
            this.marketDeck.moveCard(card, target)
            // if (this.phase !== "ready") callUpdateMarketDeck(this.marketDeck)
        }
    }

    public buyCard(card: CarbonCityZeroCard) {
        let player = this.currentPlayer
        player.setIncome(player.income - card.getCost())
        if (player.buyToTop) {
            this.marketplace.moveCard(card, player.drawDeck)
            player.setBuyToTop(false)
        } else {
            this.marketplace.moveCard(card, player.recyclePile)
        }
    }

    public winGame(player: CarbonCityZeroPlayer) {
        this.setWinner(player)
        this.status = "finished"
        console.log("WINNER" + this.winner?.name)
    }

    public setMarketSize(marketSize: number) {
        this.marketSize = marketSize
    }

    public setPlayerDrawAmount(playerDrawAmount: number) {
        this.playerDrawAmount = playerDrawAmount
    }

    public addPlayer(name: string) {
        if (this.status === "open") {
            this.players.push(new CarbonCityZeroPlayer(name))
        }
    }

    // Setters

    public setPlayers(players: CarbonCityZeroPlayer[]) {
        this.players = players
    }

    public setStatus(status: GameStatus) {
        this.status = status
    }

    public setTurn(turn: number) {
        this.turn = turn
    }

    public setPhase(phase: Phase) {
        this.phase = phase
    }

    public setMarketDeck(marketDeck: CardHolder<CarbonCityZeroCard>) {
        this.marketDeck = marketDeck
    }

    public setMarketplace(marketplace: CardHolder<CarbonCityZeroCard>) {
        this.marketplace = marketplace
    }

    public setGlobalSlot(globalSlot: CardHolder<CarbonCityZeroCard>) {
        this.globalSlot = globalSlot
    }

    public setLandfillPile(landfillPile: CardHolder<CarbonCityZeroCard>) {
        this.landfillPile = landfillPile
    }

}


// STARTING DECK

// Create Game Starting Cards
//  co  i   ca  sector              special rule                            link ability
const ecoHouses = new CarbonCityZeroCard(
    "Ecohouses",
    8,  0,  -7, Sector.Domestic,    SpecialRule.DrawCard1  
)
const greenMortgages = new CarbonCityZeroCard(
    "Green Mortgages",
    4,  2,  0,  Sector.Domestic,    SpecialRule.BuyToTop,                   LinkAbility.DecreaseCarbon1 
)
const publicAwareness = new CarbonCityZeroCard(
    "Public Awareness",
    2,  0,  -2, Sector.Domestic,    undefined,                              LinkAbility.DecreaseCarbon1
)
const retrofitBuildings = new CarbonCityZeroCard(
    "Retrofit Buildings",
    3,  0,  -2, Sector.Domestic,    SpecialRule.DrawCard1,                  LinkAbility.DecreaseCarbon1
)
const solarThermalPanels = new CarbonCityZeroCard(
    "Solar Thermal Panels",
    7,  0,  -5, Sector.Domestic,    SpecialRule.DrawCard1
)
const windPower = new CarbonCityZeroCard(
    "Wind Power",
    5,  0,  -4, Sector.Domestic,    SpecialRule.LandfillDrawnCard,          LinkAbility.DecreaseCarbon1
)
const biogasPlant = new CarbonCityZeroCard(
    "Biogas Plant",
    6,  0,  -5, Sector.Government,  SpecialRule.LandfillDrawnCard
)
const buildingInspectors = new CarbonCityZeroCard(
    "Building Inspectors",
    3,  0,  0,  Sector.Government,  SpecialRule.SearchDrawDeck
)
const districtHeating = new CarbonCityZeroCard(
    "District Heating",
    4,  1,  -2, Sector.Government,  SpecialRule.AnnulFactoryCarbon
)
const ecoCouncillors = new CarbonCityZeroCard(
    "Eco Councillors",
    6,  0,  -4, Sector.Government,  SpecialRule.SearchMarketDeckForGlobal,  LinkAbility.DecreaseCarbon2
)
const hydrogenGasMains = new CarbonCityZeroCard(
    "Hydrogen Gas Mains",
    5,  0,  0,  Sector.Government,  SpecialRule.LandfillDrawnCard,          LinkAbility.DecreaseCarbon2
)
const hydropower = new CarbonCityZeroCard(
    "Hydropower",
    3,  0,  -2, Sector.Government,  SpecialRule.LandfillDrawnCard,          LinkAbility.DecreaseCarbon2
)
const lobbyMinisters = new CarbonCityZeroCard(
    "Lobby Ministers",
    7,  0,  -6, Sector.Government,  SpecialRule.DrawCard2,                  LinkAbility.DecreaseCarbon2
)
const heatPumps = new CarbonCityZeroCard(
    "Heat Pumps",
    7,  0,  -5, Sector.Industry,    SpecialRule.DrawCard1,                  LinkAbility.AnnulFactoryCarbon
)
const largeFactory = new CarbonCityZeroCard(
    "Large Factory",
    3,  5,  4,  Sector.Industry,    SpecialRule.DrawCard2
)
const lowCarbonTech = new CarbonCityZeroCard(
    "Low Carbon Tech",
    8,  0,  -5, Sector.Industry,    SpecialRule.DrawCard2,                  LinkAbility.AnnulFactoryCarbon
)
const medimFactory = new CarbonCityZeroCard(
    "Medium Factory",
    2,  4,  3,  Sector.Industry,    SpecialRule.DrawCard1
)
const netZeroHub = new CarbonCityZeroCard(
    "Net Zero Hub",
    5,  4,  0,  Sector.Industry,    SpecialRule.DrawCard1
)
const skilledWorkforce = new CarbonCityZeroCard(
    "Skilled Workforce",
    6,  3,  0,  Sector.Industry,    SpecialRule.DrawCard2,                  LinkAbility.AnnulFactoryCarbon
)
const smallFactory = new CarbonCityZeroCard(
    "Small Factory",
    1,  3,  1,  Sector.Industry
)
const badPress = new CarbonCityZeroCard(
    "Bad Press",
    0,  0,  1,  Sector.Snag
)
const dodgyStandards = new CarbonCityZeroCard(
    "Dodgy Standards",
    0,  0,  0,  Sector.Snag
)
const fossilFuelLobby = new CarbonCityZeroCard(
    "Fossil Fuel Lobby",
    0,  0,  1,  Sector.Snag
)
const fundingCuts = new CarbonCityZeroCard(
    "Funding Cuts",
    0,  -1, 0,  Sector.Snag
)
const governmentUncertainty = new CarbonCityZeroCard(
    "Government Uncertainty",
    0,  0,  1,  Sector.Snag
)
const localOppositon = new CarbonCityZeroCard(
    "Local Opposition",
    0,  0,  0,  Sector.Snag,        SpecialRule.AnnulLinkAbilities
)
const poorCommunication = new CarbonCityZeroCard(
    "Poor Communication",
    0,  0,  0,  Sector.Snag
)
const poorLeadership = new CarbonCityZeroCard(
    "Poor Leadership",
    0,  0,  0,  Sector.Snag
)
const publicApathy = new CarbonCityZeroCard(
    "Public Apathy",
    0,  0,  0,  Sector.Snag
)
const behaviouralChange = new CarbonCityZeroCard(
    "Behavioural Change",
    0,  0,  0,  Sector.Global,      SpecialRule.IncreaseMarketplace
)
const increasedFunding = new CarbonCityZeroCard(
    "IncreasedFunding",
    0,  0,  0,  Sector.Global,      SpecialRule.DecreaseCosts
)
const newBuildingRegulations = new CarbonCityZeroCard(
    "New Building Regulations",
    0,  0,  0,  Sector.Global,      SpecialRule.IncreaseDrawnCards
)

// Create Game Starting Deck
const gameStartingDeck = new CardHolder<CarbonCityZeroCard>() 
gameStartingDeck.addCards([
    ecoHouses,
    greenMortgages,
    greenMortgages,
    greenMortgages,
    publicAwareness,
    publicAwareness,
    publicAwareness,
    retrofitBuildings,
    retrofitBuildings,
    retrofitBuildings,
    solarThermalPanels,
    solarThermalPanels,
    windPower,
    windPower,
    windPower,
    biogasPlant,
    biogasPlant,
    buildingInspectors,
    buildingInspectors,
    districtHeating,
    districtHeating,
    districtHeating,
    ecoCouncillors,
    hydrogenGasMains,
    hydrogenGasMains,
    hydrogenGasMains,
    hydropower,
    hydropower,
    hydropower,
    lobbyMinisters,
    heatPumps,
    largeFactory,
    largeFactory,
    lowCarbonTech,
    medimFactory,
    medimFactory,
    medimFactory,
    netZeroHub,
    netZeroHub,
    skilledWorkforce,
    smallFactory,
    smallFactory,
    smallFactory,
    smallFactory,
    smallFactory,
    badPress,
    dodgyStandards,
    fossilFuelLobby,
    fundingCuts,
    governmentUncertainty,
    localOppositon,
    poorCommunication,
    poorLeadership,
    publicApathy,
    behaviouralChange,
    behaviouralChange,
    increasedFunding,
    increasedFunding,
    newBuildingRegulations,
    newBuildingRegulations
])
import React from 'react'
import Timer from '../Timer/Timer'
import Card from './card'
import styles from './Game.scss'

export default class Game extends React.Component {

  constructor(props) {
    super(props)
    this.processMove = this.processMove.bind(this)
    this.changeDifficulty = this.changeDifficulty.bind(this)
    this.startGame = this.startGame.bind(this)
    this.updateTimer = this.updateTimer.bind(this)
    this.state = {
      difficulty: 'easy',
      cards: [],
      running: false,
      lastMoveId: null,
      locked: true,
      elapsedTime: 0,
    }
  }

  componentWillMount() {
    this.props.requestCards()
  }

  componentWillReceiveProps(nextProps) {
    this.setCards(nextProps.cards)
  }

  setCards(data) {
    const cards = []
    let icons = []
    data.levels.forEach((level) => {
      if (level.difficulty === this.state.difficulty) {
        icons = level.cards
      }
    })
    icons.forEach((icon) => {
      const card = { icon, flipped: false, matched: false }
      cards.push(card)
    })
    this.setState({ cards })
  }

  processMove(id) {
    const newCardsState = this.state.cards
    if (this.state.locked) {
      return
    } else {
      newCardsState[id].flipped = true
    }
    if (this.state.lastMoveId === null) {
      this.setState({ cards: newCardsState, lastMoveId: id })
    } else {
      this.setState({ cards: newCardsState, locked: true })
      this.checkMatch(id)
    }
    if (this.gameWon()) {
      console.log(this.state.elapsedTime)
      this.setState({ running: false, locked: true })
    }
  }

  checkMatch(id) {
    const newCardsState = this.state.cards
    if (this.state.cards[id].icon === this.state.cards[this.state.lastMoveId].icon) {
      newCardsState[id].matched = true
      newCardsState[id].flipped = true
      newCardsState[this.state.lastMoveId].matched = true
      this.setState({
        cards: newCardsState,
        lastMoveId: null,
        locked: false })
    } else {
      setTimeout(() => {
        newCardsState[id].flipped = false
        newCardsState[this.state.lastMoveId].flipped = false
        this.setState({
          cards: newCardsState,
          lastMoveId: null,
          locked: false })
      }, 500)
    }
  }

  gameWon() {
    let isWon = true
    this.state.cards.forEach((card) => {
      if (!card.matched) {
        isWon = false
      }
    })
    return isWon
  }

  makeCards() {
    if (this.state.cards.length > 0) {
      return this.state.cards.map((card, id) =>
        <Card
          id={id}
          icon={card.icon}
          flipped={card.flipped}
          matched={card.matched}
          processMove={this.processMove}
        />
    ) }
    return []
  }

  changeDifficulty() {
    const difficulty = (this.state.difficulty === 'easy') ? 'hard' : 'easy'
    this.setState({ difficulty }, () => {
      this.setCards(this.props.cards)
    })
  }

  startGame() {
    this.setState({ running: true, locked: false })
  }

  updateTimer() {
    this.setState({ elapsedTime: this.state.elapsedTime + 1 })
  }

  render() {
    const cards = this.makeCards()
    let timer
    let startButton

    if (this.state.running) {
      timer = <Timer updateTimer={this.updateTimer} />
    } else {
      startButton = <div onClick={this.startGame}>start</div>
    }

    return (
      <div>
        <h1 className={styles.header}>Memory Game</h1>
        <div onClick={this.changeDifficulty}>change</div>
        {startButton}
        {timer}
        <div className={styles.gamearea}>
          {cards}
        </div>
      </div>
    )
  }
}

Game.propTypes = {
  cards: React.PropTypes.object.isRequired,
  requestCards: React.PropTypes.func.isRequired,
}

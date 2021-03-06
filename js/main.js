const img = ['10_tiger.png', '11_penguin.png', '12_racoon.png', '1_pig.png', '2_squirrel.png', '3_rabbit.png', '4_frog.png', '5_fox.png', '6_bear.png', '7_monkey.png', '8_panda.png', '9_chick.png']
const template = qs('#card')
const wrapper = qs('.wrapper')
let currentlySelected = []
const data = {}
let point = 0
// var crypto = require("crypto-js/core")

function qs (selector) {
  return document.querySelector(selector)
}

function qsa (selector) {
  return document.querySelectorAll(selector)
}

function createCard (id) {
  let card = template.content.cloneNode(true)
  card = card.querySelector('div')
  card.setAttribute('data-id', id)
  return card
}

function uuidv4 () {
  let dt = new Date().getTime()

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })

  return uuid
}

// Can the card be pressed?
// Ie. not locked and not 2 already selected
// #=> true / false
function cardLocked (element) {
  return (element.getAttribute('data-lock') === 'true')
}

// The card has been flipped?
// #=> true / false
function cardIsFlipped (element) {
  return (element.classList.contains('flipped'))
}

// Is there a pair?
// #=> true / false
function isPair (element) {
  return (data[currentlySelected[0].getAttribute('data-id')] === data[element.getAttribute('data-id')])
}

// Should the card be flipped back? There are two flipped cards
// Ie. Is flipped and not locked
// #=> true / false
function shouldFlipBack (element) {
  return (element.classList.contains('flipped') && element.getAttribute('data-lock') !== 'true')
}

// Locks both elements when a pair has been found
function lockPair (element) {
  element.setAttribute('data-lock', true)
  currentlySelected[0].setAttribute('data-lock', true)
}

// Flips a card back
function flipBackCard (element) {
  element.classList.remove('flipped')
  element.classList.add('card-animation')
  setTimeout(() => {
    element.style.backgroundImage = 'url(./img/back.png)'
  }, 500)
  setTimeout(() => {
    element.classList.remove('card-animation')
  }, 500)
  const x = currentlySelected.indexOf(element)
  currentlySelected.splice(x, 1)
}

// Flips a card
function flipCard (element) {
  element.classList.add('flipped')
  element.classList.add('card-animation')
  setTimeout(() => {
    element.style.backgroundImage = `url(img/${data[element.getAttribute('data-id')]})`
  }, 500)
  setTimeout(() => {
    element.classList.remove('card-animation')
  }, 1000)
}

// Add point
function addPoint () {
  point += 1
}

// Save the score to localStorage
function savePoints (name) {
  const x = JSON.parse(window.localStorage.getItem('highScore'))
  x[name] = point
  window.localStorage.setItem('highScore', JSON.stringify(x))
}

// Reset the current score
function resetPoints () {
  point = 0
}

// Returns the saved leaderboard from localStorage
function getLeaderboard () {
  return JSON.parse(window.localStorage.getItem('highScore'))
}

// Returns the leaderboard keys sorted as an Array
function getLeaderboardKeysSorted () {
  const scores = getLeaderboard()
  return Object.keys(scores).sort(function (a, b) {
    return scores[a] - scores[b]
  })
}

// Handling the gamelogic
function cardPressed (e) {
  if (!cardLocked(e.target)) {
    if (currentlySelected.length === 2 && !currentlySelected.includes(e.target)) {
      // Auto toggle back
      flipBackCard(currentlySelected[0])
      flipBackCard(currentlySelected[0])
    }
    if (cardIsFlipped(e.target)) {
      flipBackCard(e.target)
    } else {
      addPoint()
      // Open a card
      flipCard(e.target)
      if (currentlySelected.length === 0) {
        // First press
        currentlySelected.push(e.target)
      } else if (isPair(e.target)) {
        // A pair has been found
        lockPair(e.target)
        currentlySelected = []
        if (isTheGameOver()) {
          displayGameOverOverlay()
        }
        console.log('A pair!')
      } else {
        // Not a pair
        currentlySelected.push(e.target)
        console.log('Not a pair')
      }
    }
  } else {
    if (shouldFlipBack(e.target)) {
      flipBackCard(e.target)
    }
  }
}

// Displays the game win overlay
function displayGameOverOverlay () {
  const container = document.createElement('div')
  container.classList.add('game-over')
  container.appendChild(gameOverOverlayTitle())
  container.appendChild(gameOverOverlayPointBoard())
  container.append(gameOverOverlayLeaderBoard())
  container.append(gameOverOverlayRestart())
  container.append(gameOverOverlayInput())
  container.append(gameOverOverlayButton())

  wrapper.appendChild(container)
  setTimeout(() => {
    qs('.game-over').style.right = '0'
  }, 1500)
}

function gameOverOverlayButton () {
  const tempButton = document.createElement('button')
  tempButton.addEventListener('click', submitScore)
  tempButton.textContent = 'Save Score'
  return tempButton
}

function gameOverOverlayInput () {
  const temp = document.createElement('input')
  temp.required = 'true'
  temp.placeholder = 'Name'
  return temp
}

function gameOverOverlayRestart () {
  const temp = document.createElement('p')
  temp.addEventListener('click', resetGame)
  temp.innerHTML = 'Restart'
  return temp
}

function gameOverOverlayLeaderBoard () {
  const temp = document.createElement('p')
  temp.addEventListener('click', leaderboard)
  temp.innerHTML = 'Leaderboard'
  return temp
}

function gameOverOverlayTitle () {
  const temp = document.createElement('h1')
  if (point < getLeaderboard()[getLeaderboardKeysSorted()[0]]) {
    temp.innerHTML = 'New High Score'
  } else {
    temp.innerHTML = 'You Won'
  }
  return temp
}

function gameOverOverlayPointBoard () {
  const temp = document.createElement('h4')
  temp.textContent = `You ${point} | Perfect ${img.length * 2} | High Score ${(Object.keys(getLeaderboard()).length === 0) ? 'X' : getLeaderboard()[getLeaderboardKeysSorted()[0]]}`
  return temp
}

// Saves the points to the provided name
function submitScore (e) {
  if (e.target.previousElementSibling.value.length > 1) {
    savePoints(e.target.previousElementSibling.value)
    leaderboard()
  } else {
    alert('Invalid name provided')
  }
  e.preventDefault()
}

// Displays the leaderboard
function leaderboard (e) {
  const leaderboard = document.createElement('div')
  leaderboard.classList.add('leaderboard')
  const back = document.createElement('span')
  back.textContent = '←'
  back.addEventListener('click', removeLeaderboard)
  leaderboard.append(back)
  const container = document.createElement('div')

  const title = document.createElement('h1')
  title.textContent = 'Leaderboard'
  container.append(title)

  leaderboard.appendChild(generateScoreList(container))

  wrapper.appendChild(leaderboard)
}

function generateScoreList (container) {
  const scores = getLeaderboard()
  for (const key of getLeaderboardKeysSorted()) {
    const temp = document.createElement('p')
    temp.textContent = `${key}: ${scores[key]}`
    container.appendChild(temp)
  }
  return container
}

// Removes the leaderboard from the document
function removeLeaderboard () {
  qs('.leaderboard').outerHTML = ''
}

// Is the game over?
// #=> true/false
function isTheGameOver () {
  return qsa('.flipped[data-lock="true"]').length === img.length * 2
}

function game () {
  const holder = []
  // Generate gameboard
  for (const e of img) {
    const randomID = uuidv4()
    const randomID2 = uuidv4()
    data[randomID] = e
    data[randomID2] = e
    holder.push(createCard(randomID))
    holder.push(createCard(randomID2))
  }

  // Render gameboard
  holder.sort(function (a, b) {
    return 0.5 - Math.random()
  })
  for (const e of holder) {
    e.addEventListener('click', cardPressed)
    wrapper.appendChild(e)
  }
}

function resetGame () {
  qs('.wrapper').innerHTML = ''
  resetPoints()
  game()
}

game()
initialize()

// initializes eventListeners
function initialize () {
  qs('header h3').addEventListener('click', () => {
    leaderboard()
  })
  if (typeof window.localStorage.getItem('highScore') === 'object' && window.localStorage.getItem('highScore') == null) {
    window.localStorage.setItem('highScore', JSON.stringify({}))
  }
}

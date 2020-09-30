const img = ['10_tiger.png', '11_penguin.png', '12_racoon.png', '1_pig.png', '2_squirrel.png', '3_rabbit.png', '4_frog.png', '5_fox.png', '6_bear.png', '7_monkey.png', '8_panda.png', '9_chick.png']
const template = document.querySelector('#card')
const wrapper = document.querySelector('.wrapper')
let currentlySelected = []
let data = {}

function createCard(id) {
  let card = template.content.cloneNode(true)
  card = card.querySelector('div')
  card.setAttribute('data-id', id)
  return card
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Can the card be pressed?
// Ie. not locked and not 2 already selected
// #=> true / false
function cardCanBePressed(element) {
  return (element.getAttribute('data-lock') != 'true' && currentlySelected.length != 2)
}

// The card has been flipped?
// #=> true / false
function cardIsFlipped(element){
  return (element.classList.contains('flipped'))
}

// Is there a pair?
// #=> true / false
function isPair(element){
  return (data[currentlySelected[0].getAttribute('data-id')] == data[element.getAttribute('data-id')])
}

// Should the card be flipped back? There are two flipped cards
// Ie. Is flipped and not locked
// #=> true / false
function shouldFlipBack(element){
  return (element.classList.contains('flipped') && element.getAttribute('data-lock') != 'true')
}

// Locks both elements when a pair has been found
function lockPair(element) {
  element.setAttribute('data-lock', true)
  currentlySelected[0].setAttribute('data-lock', true)
}

// Flips a card back
function flipBackCard(element) {
  element.classList.remove('flipped')
  element.style.backgroundImage = `url(/img/back.png)`
  let x = currentlySelected.indexOf(element)
  currentlySelected.splice(x, 1)
}

// Flips a card
function flipCard(element) {
  element.classList.add('flipped')
  element.style.backgroundImage = `url(img/${data[e.target.getAttribute('data-id')]})`
}

function cardPressed(e) {
  if (cardCanBePressed(e.target)){    
    if (cardIsFlipped(e.target)) {
      flipBackCard(e.target)
    } else {
      // Open a card
      flipCard(e.target)
      if (currentlySelected.length == 0) {
        // First press
        currentlySelected.push(e.target)
      }else if(isPair(e.target)) {
        // A pair has been found
        lockPair(e.target)
        currentlySelected = []
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

function game(){
  let holder = []
  // Generate gameboard
  for (let e of img) {
      let randomID = uuidv4()
      let randomID2 = uuidv4()
      data[randomID] = e
      data[randomID2] = e
      holder.push(createCard(randomID))
      holder.push(createCard(randomID2))
  }

  // Render gameboard
  holder.sort(function (a, b) { return 0.5 - Math.random() })
  for(let e of holder) {
    e.addEventListener('click', cardPressed)
    wrapper.appendChild(e)
  }
}

game()

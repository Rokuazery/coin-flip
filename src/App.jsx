import { invoke } from '@tauri-apps/api/tauri'
import { useState } from 'react'
import $ from 'jquery';
import './App.css'

import head from './assets/head.svg'
import tail from './assets/tail.svg'
import click from './assets/click.mp3'
import coin_1 from './assets/coin_1.mp3'
import coin_2 from './assets/coin_2.mp3'

function App() {
  const [coinClass, setCoinClass] = useState(0)
  const [coinFace, setCoinFace] = useState("Flip the coin")
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipCount, setFlipCount] = useState(0)
  const [headsCount, setHeadsCount] = useState(0)
  const [tailsCount, setTailsCount] = useState(0)
  const [buttonState, setButtonState] = useState(null);
  const [flips, setFlips] = useState([]);

  let buttonAudio = new Audio(click)
  let coinAudio_1 = new Audio(coin_1)
  let coinAudio_2 = new Audio(coin_2)

 const scrollSmoothlyToBottom = (id) => {
  const element = $(`#${id}`); 
  element.animate({
     scrollTop: element.prop("scrollHeight")
  }, 1000);
}

const Reset = () => {
  buttonAudio.play()
  setFlipCount(0)
  setHeadsCount(0)
  setTailsCount(0)
  invoke('clear_flip_history')
  invoke('get_flip_history').then((history) =>{ setFlips(history)})
}

const Flip = () => {
  if(!isFlipping)
  {
    coinAudio_1.play()
    setCoinClass(null)
    setIsFlipping(true)
    setButtonState("disabled")
    setCoinFace("Flipping...")
    
    setFlipCount((flipCount) => flipCount + 1)
    invoke('flip_coin').then((coinResult) => {
    setCoinClass(coinResult)
      
    setTimeout(() => { // wait for the animation to finish
      coinAudio_2.play();
      setButtonState(null)
      setIsFlipping(false)
      setCoinFace(coinResult)
      invoke('get_flip_history').then((history) =>{setFlips(history)})
      invoke('get_heads_amount').then((amount) => {setHeadsCount(amount)})
      invoke('get_tails_amount').then((amount) => {setTailsCount(amount)})
      scrollSmoothlyToBottom('history')
      }, 3000)
    })
  }
}
  return (
    <body>
      <div id="tracker">
        <p id="tracker-p">flipped count: {flipCount} | HEADS: {headsCount} | TAILS: {tailsCount}</p>
        <div className='history-container' id='history'>
          {flips.map((flip) => (<p className='history-p'>{flip}</p>))}
        </div>
      </div>
      <header className="App-header">
          <div id="coin" className={coinClass}>
            <div className="side-heads"><img src={head}></img></div>
            <div className="side-tails"><img src={tail}></img></div>
          </div>
          <p>{coinFace}</p>
          <p>
            <button type="button" onClick={Flip} disabled={buttonState}>
              Flip it
            </button>
          </p>
          <p className='Author' onClick={()=>{invoke('open_github_url')}}>Rokuazery's Github ❤️</p>
          <button id='reset' type="button" onClick={Reset} disabled={buttonState}>
              <span>Reset </span>
          </button>
        </header>
    </body>
  )
}

export default App

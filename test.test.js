// import {
//   fireEvent,
//   getByText,
//   getByDisplayValue
// } from '@testing-library/dom'
import '@testing-library/jest-dom/extend-expect'
import {
  JSDOM,
  // VirtualConsole,
  CookieJar
} from 'jsdom'
import fs from 'fs'
import path from 'path'

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8')

let container

describe('index.html', () => {
  beforeEach((done) => {
    // Constructing a new JSDOM with this option is the key
    // to getting the code in the script tag to execute.
    // This is indeed dangerous and should only be done with trusted content.
    // https://github.com/jsdom/jsdom#executing-scripts

    let dom = new JSDOM(html, {
      runScripts: 'outside-only'
    })
    const localStorageHack = `
    const _localStorage = {
        getItem: function (key) {
            return this[key];
        },
        setItem: function (key, value) {
            this[key] = value;
        }
    };`
    dom.window.eval(`document.head.appendChild(function(){
        let elm = document.createElement('script');
        elm.innerHTML = \`${localStorageHack}\`;
        return elm;
    }());`)
    const js = fs.readFileSync(path.resolve(__dirname, html.match(/src="(.+)"/)[1]), 'utf8').replace(/[`.*+?^${}()|[\]\\]/g, '\\$&').replace(/localStorage/g, '_$&')
    dom.window.eval('document.body.querySelector(\'script\').removeAttribute(\'src\')')
    dom.window.eval(`document.body.querySelector('script').innerHTML = \`${js}\``)

    const options = {
      resources: 'usable',
      runScripts: 'dangerously',
      cookieJar: new CookieJar(),
      url: new URL('file:' + path.resolve('./index.html'))
    }

    dom = new JSDOM(dom.serialize(), options)

    setTimeout(() => {
      container = dom.window.document.body
      done()
    }, 500)
  })

  it('has a wrapper', () => {
    expect(container.querySelector('.wrapper')).not.toBeNull()
  })

  it('has a header', () => {
    expect(container.querySelector('header h1')).not.toBeNull()
    expect(container.querySelector('header h1').textContent).toEqual('Memory Game')
    expect(container.querySelector('header h3')).not.toBeNull()
    expect(container.querySelector('header h3').textContent).toEqual('Leaderboard')
  })

  it('has 24 cards', () => {
    expect(container.querySelector('.card')).not.toBeNull()
    expect(container.querySelectorAll('.card').length).toEqual(24)
  })
})

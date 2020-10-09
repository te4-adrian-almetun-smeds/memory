import { JSDOM } from 'jsdom'
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

// const localStorageMock = {
//     getItem: jest.fn(),
//     setItem: jest.fn(),
//     clear: jest.fn()
//   };
// global.localStorage = localStorageMock;

var localStorageMock = (function () {
  var store = {}
  return {
    getItem: function (key) {
      return store[key]
    },
    setItem: function (key, value) {
      store[key] = value.toString()
    },
    clear: function () {
      store = {}
    },
    removeItem: function (key) {
      delete store[key]
    }
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

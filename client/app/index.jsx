import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import walletManagementApp from './reducers'
const Main = require('Main')
import { BrowserRouter, Route } from 'react-router-dom'

const store = createStore(walletManagementApp)

ReactDOM.render((
	<Provider store={store}>
		<BrowserRouter>
			<Route path="/" component={Main} />
		</BrowserRouter>
	</Provider>)
	, document.getElementById("root"))
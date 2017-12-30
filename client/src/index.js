// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import registerServiceWorker from './registerServiceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import walletManagementApp from './app/reducers'
// import Main from './app/components/layouts/main.js'
// import Account from './app/components/signin-signup/signin.js'
import { AppContainer } from 'react-hot-loader'
// import App from './App'
import { BrowserRouter, Route } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'
// import '../semantic/dist/semantic.min.css'
import App from './app/components/index.js'
// import admin from '@modules/admin'
// import home from '@modules/home'
import ReduxThunkMiddleware from 'redux-thunk'

const store = createStore(
    walletManagementApp,
    applyMiddleware(
        ReduxThunkMiddleware
    )
)

ReactDOM.render((
    <AppContainer>
        <Provider store={store}>

            <BrowserRouter>
                <Route path="/" component={App} />
            </BrowserRouter>

        </Provider>
    </AppContainer>)
    , document.getElementById("root"))
registerServiceWorker()
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
import { createStore } from 'redux'
import walletManagementApp from './app/reducers'
import Main from './app/components/layouts/main.js'
// import App from './App'
import { BrowserRouter, Route } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'
const store = createStore(walletManagementApp)

ReactDOM.render((
    <Provider store={store}>
        <BrowserRouter>
            <Route path="/" component={Main} />
        </BrowserRouter>
    </Provider>)
    , document.getElementById("root"))
registerServiceWorker()
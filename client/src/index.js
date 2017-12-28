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
import { AppContainer } from 'react-hot-loader'
// import App from './App'
import { BrowserRouter, Route } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'
// import '../semantic/dist/semantic.min.css'
const store = createStore(walletManagementApp)

ReactDOM.render((
    <Provider store={store}>
        <AppContainer>
            <BrowserRouter>
                <Route path="/" component={Main} />
            </BrowserRouter>
        </AppContainer>
    </Provider>)
    , document.getElementById("root"))
registerServiceWorker()
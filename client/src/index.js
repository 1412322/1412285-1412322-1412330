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
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'
// import '../semantic/dist/semantic.min.css'
// import App from './app/components/index.js'
// import admin from '@modules/admin'
// import home from '@modules/home'
import ReduxThunkMiddleware from 'redux-thunk'
import LoginContainer from './app/components/account/signin.js'
import RegisterContainer from './app/components/account/signup.js'
import RetrievePasswordContainer from './app/components/account/retrievepassword.js'
import ResetPasswordContainer from './app/components/account/resetpassword.js'
import GoogleAuthContainer from './app/components/account/googleauth.js'
import ProfileContainer from './app/components/home/profile.js'
import MainLayout from './app/components/layouts/main.js'
import AppRoute from './app/index.js'

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
                <Switch>
                    {/* <MainLayout exact={true} path="/" component={NewsfeedContainer} /> */}
                    <AppRoute exact={true} path="/" layout={MainLayout} component={ProfileContainer} />
                    {/* <MainLayout path="/"><NewsfeedContainer /></MainLayout>
                    <MainLayout path="/profile"><ProfileContainer /></MainLayout> */}
                    <Route path='/signin' component={LoginContainer} />
                    <Route path='/signup' component={RegisterContainer} />
                    <Route path='/retrievepassword' component={RetrievePasswordContainer} />
                    <Route path='/resetpassword/:id' component={ResetPasswordContainer} />
                    <Route path='/verify/:key' component={GoogleAuthContainer} />
                    <Redirect to='/' />
                </Switch>
            </BrowserRouter>

        </Provider>
    </AppContainer>)
    , document.getElementById("root"))
registerServiceWorker()

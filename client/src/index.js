import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import walletManagementApp from './app/reducers'
import { AppContainer } from 'react-hot-loader'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'
import ReduxThunkMiddleware from 'redux-thunk'
import LoginContainer from './app/components/account/signin.js'
import RegisterContainer from './app/components/account/signup.js'
import RetrievePasswordContainer from './app/components/account/retrievepassword.js'
// import ResetPasswordContainer from './app/components/account/resetpassword.js'
import ResetPasswordByGoogleAuthContainer from './app/components/account/resetpasswordbygoogleauth.js'
import VerifyEmailByGoogleAuthContainer from './app/components/account/verifyemailbygoogleauth.js'
import ProfileContainer from './app/components/home/profile.js'
import TransferContainer from './app/components/transaction/transfer.js'
import StatisticContainer from './app/components/admin/statistics.js'
import TransactionDataContainer from './app/components/admin/transactions.js'
import AddressDataContainer from './app/components/admin/addresses.js'
import AccessDeniedContainer from './app/components/errorpage/403.js'
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
                    <AppRoute exact={true} path="/" layout={MainLayout} component={ProfileContainer} />
                    <AppRoute path="/transaction/transfer" layout={MainLayout} component={TransferContainer} />
                    <AppRoute path="/admin/statistics" layout={MainLayout} component={StatisticContainer} />
                    <AppRoute path="/admin/transactions" layout={MainLayout} component={TransactionDataContainer} />
                    <AppRoute path="/admin/addresses" layout={MainLayout} component={AddressDataContainer} />
                    <AppRoute path="/admin/403" layout={MainLayout} component={AccessDeniedContainer} />
                    <Route path='/signin' component={LoginContainer} />
                    <Route path='/signup' component={RegisterContainer} />
                    <Route path='/retrievepassword' component={RetrievePasswordContainer} />
                    <Route path='/2faresetpassword/' component={ResetPasswordByGoogleAuthContainer} />
                    <Route path='/verify/:key' component={VerifyEmailByGoogleAuthContainer} />
                    <Redirect to='/' />
                </Switch>
            </BrowserRouter>

        </Provider>
    </AppContainer>)
    , document.getElementById("root"))
registerServiceWorker()

import { combineReducers } from 'redux'
import user from './user'
import account from './account'

const walletManagementApp = combineReducers({
  user,
  account
})

export default walletManagementApp
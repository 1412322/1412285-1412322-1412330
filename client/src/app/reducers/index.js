import { combineReducers } from 'redux'
import user from './user'
import account from './account'
import transaction from './transaction'

const walletManagementApp = combineReducers({
  user,
  account,
  transaction
})

export default walletManagementApp
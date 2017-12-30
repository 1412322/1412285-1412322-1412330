import { combineReducers } from 'redux'
import transfer from './transfer'
import account from './account'

const walletManagementApp = combineReducers({
  transfer,
  account
})

export default walletManagementApp
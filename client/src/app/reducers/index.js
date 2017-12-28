import { combineReducers } from 'redux'
import transfer from './transfer'
import authen from './authen'

const walletManagementApp = combineReducers({
  transfer,
  authen
})

export default walletManagementApp
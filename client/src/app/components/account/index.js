import LoginContainer from './signin.js'
import RegisterContainer from './signup.js'

const routes = [
  {
    path: '/signin',
    component: LoginContainer,
  },
  {
    path: '/signup',
    component: RegisterContainer,
  },
]

export default routes

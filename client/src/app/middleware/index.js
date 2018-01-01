import Server from '../../server.js'
import { 
    signInSubmit,
    signInSuccessed,
    signInFailed,
    signUpSubmit,
    signUpSuccessed,
    signUpFailed,
    retrievePasswordSubmit,
    retrievePasswordSuccessed,
    retrievePasswordFailed,
} from '../actions'

export function signIn(body, headers) {
    return function (dispatch) {
      dispatch(signInSubmit(body, headers))
      return fetch(Server.server() + 'api/users/signin', {
        method: 'post',
        body: JSON.stringify(body),
        headers: headers,
      })
        .then(res => res.json())
        .then((data) => {
          console.log(data)
          if (data.success === true) {
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('email', data.email)
            console.log('success signin')
            dispatch(signInSuccessed(true, null))
  
          }
          else {
            console.log('fail signin')
            dispatch(signInFailed(false, data.msg))
          }
        })
    }
  }
  
  export function signUp(body, headers) {
    return function (dispatch) {
      dispatch(signUpSubmit(body, headers))
      return fetch(Server.server() + 'api/users/signup', {
        method: 'post',
        body: JSON.stringify(body),
        headers: headers,
      })
        .then(res => res.json())
        .then((data) => {
          if (data.success === true) {
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('email', data.email)
            dispatch(signUpSuccessed(true, data.msg, data))
  
          }
          else {
            dispatch(signUpFailed(false, data.msg))
          }
        })
    }
  }
  
  export function retrievePassword(body, headers) {
    return function (dispatch) {
      dispatch(retrievePasswordSubmit(body, headers))
      return fetch(Server.server() + 'api/users/forgetpassword', {
        method: 'post',
        body: JSON.stringify(body),
        headers: headers,
      })
        .then(res => res.json())
        .then((data) => {
          if (data.success === true) {
            dispatch(retrievePasswordSuccessed(data.msg))
          }
          else {
            dispatch(retrievePasswordFailed(data.msg))
          }
        })
    }
  }
  
  export function resetPassword(body, headers, id) {
    return function (dispatch) {
      dispatch(retrievePasswordSubmit(body, headers))
      return fetch(Server.server() + 'api/users/resetpassword/' + id, {
        method: 'post',
        body: JSON.stringify(body),
        headers: headers,
      })
        .then(res => res.json())
        .then((data) => {
          if (data.success === true) {
            dispatch(retrievePasswordSuccessed(data.msg))
          }
          else {
            dispatch(retrievePasswordFailed(data.msg))
          }
        })
    }
  }
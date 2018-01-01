import Server from '../../server.js'

export const signInSubmit = (body, headers) => ({
  type: 'SIGN_IN',
  body,
  headers,
})

export const signInSuccessed = (isRedirect, errorMessage) => ({
  type: 'SIGN_IN_SUCCESS',
  isRedirect,
  errorMessage,
})

export const signInFailed = (isRedirect, errorMessage) => ({
  type: 'SIGN_IN_FAILED',
  isRedirect,
  errorMessage,
})

export const signUpSubmit = (body, headers) => ({
  type: 'SIGN_UP',
  body,
  headers,
})

export const signUpSuccessed = (isRedirect, errorMessage, data) => ({
  type: 'SIGN_UP_SUCCESS',
  isRedirect,
  errorMessage,
  data,
})

export const signUpFailed = (isRedirect, errorMessage) => ({
  type: 'SIGN_UP_FAILED',
  isRedirect,
  errorMessage,
})

export const resetErrorMessage = () => ({
  type: 'RESET_ERROR_MESSAGE',
})

export const retrievePasswordSubmit = (body, headers) => ({
  type: 'RETRIEVE_PASSWORD',
  body,
  headers,
})

export const retrievePasswordSuccessed = (errorMessage) => ({
  type: 'RETRIEVE_PASSWORD_SUCCESS',
  errorMessage,
})

export const retrievePasswordFailed = (errorMessage) => ({
  type: 'RETRIEVE_PASSWORD_FAILED',
  errorMessage,
})

export const resetPasswordSubmit = (body, headers) => ({
  type: 'RESET_PASSWORD',
  body,
  headers,
})

export const resetPasswordSuccessed = (errorMessage) => ({
  type: 'RESET_PASSWORD_SUCCESS',
  errorMessage,
})

export const resetPasswordFailed = (errorMessage) => ({
  type: 'RESET_PASSWORD_FAILED',
  errorMessage,
})

export const signOut = () => ({
  type: 'SIGN_OUT',
})

export const getProfile = (headers) => ({
  type: 'GET_PROFILE',
  headers,
})

export const getProfileSuccessed = (welcomeMessage, email, address, realMoney, availableMoney, token) => ({
  type: 'GET_PROFILE_SUCCESS',
  welcomeMessage,
  email,
  address,
  realMoney,
  availableMoney,
  token
})

export const getProfileFailed = (errorMessage) => ({
  type: 'GET_PROFILE_FAILED',
  errorMessage,
})

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
    dispatch(resetPasswordSubmit(body, headers))
    return fetch(Server.server() + 'api/users/resetpassword/' + id, {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          dispatch(resetPasswordSuccessed(data.msg))
        }
        else {
          dispatch(resetPasswordFailed(data.msg))
        }
      })
  }
}

export function getUserProfile(headers) {
  return function (dispatch) {
    dispatch(getProfile(headers))
    return fetch(Server.server() + 'api/users/profile', {
      method: 'get',
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          console.log(data.msg)
          dispatch(getProfileSuccessed(data.msg, data.email, data.address, data.realMoney, data.availableMoney, data.token))
        }
        else {
          dispatch(getProfileFailed(data.msg))
        }
      })
  }
}
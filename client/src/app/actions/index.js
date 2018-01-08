import Server from '../../server.js'
import * as ls from 'local-storage'

export const signInSubmit = (body, headers) => ({
  type: 'SIGN_IN',
  body,
  headers,
})

export const signInSuccessed = (data) => ({
  type: 'SIGN_IN_SUCCESS',
  data,
})

export const signInFailed = (data) => ({
  type: 'SIGN_IN_FAILED',
  data
})

export const signUpSubmit = (body, headers) => ({
  type: 'SIGN_UP',
  body,
  headers,
})

export const signUpSuccessed = (data) => ({
  type: 'SIGN_UP_SUCCESS',
  data,
})

export const signUpFailed = (data) => ({
  type: 'SIGN_UP_FAILED',
  data
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

export const resetPasswordByGoogleAuthSubmit = (body, headers) => ({
  type: 'RESET_PASSWORD_BY_GOOGLE_AUTH',
  body,
  headers,
})

export const resetPasswordByGoogleAuthSuccessed = (data) => ({
  type: 'RESET_PASSWORD_BY_GOOGLE_AUTH_SUCCESS',
  data,
})

export const resetPasswordByGoogleAuthFailed = (data) => ({
  type: 'RESET_PASSWORD_BY_GOOGLE_AUTH_FAILED',
  data,
})

export const signOut = () => ({
  type: 'SIGN_OUT',
})

export const getProfile = (headers) => ({
  type: 'GET_PROFILE',
  headers,
})

export const getProfileSuccessed = (data) => ({
  type: 'GET_PROFILE_SUCCESS',
  data,
})

export const getProfileFailed = (data) => ({
  type: 'GET_PROFILE_FAILED',
  data,
})

export const verifyEmailByGoogleAuthSubmit = (body, headers) => ({
  type: 'VERIFY_EMAIL_BY_GOOGLE_AUTH',
  body,
  headers,
})

export const verifyEmailByGoogleAuthSuccessed = (data) => ({
  type: 'VERIFY_EMAIL_BY_GOOGLE_AUTH_SUCCESS',
  data,
})

export const verifyEmailByGoogleAuthFailed = (data) => ({
  type: 'VERIFY_EMAIL_BY_GOOGLE_AUTH_FAILED',
  data,
})

export const getQRCode = (headers) => ({
  type: 'GET_QRCODE',
  headers,
})

export const getQRCodeSuccessed = (data) => ({
  type: 'GET_QRCODE_SUCCESS',
  data,
})

export const getQRCodeFailed = (data) => ({
  type: 'GET_QRCODE_FAILED',
  data,
})

export const getStatisticData = (headers, body) => ({
  type: 'CHECK_ROLE',
  headers,
  body,
})

export const getStatisticDataSuccessed = (data, offset, limit) => ({
  type: 'CHECK_ROLE_SUCCESS',
  data,
  offset, 
  limit,
})

export const getStatisticDataFailed = (data) => ({
  type: 'CHECK_ROLE_FAILED',
  data,
})

export const getTransactionData = (headers, body) => ({
  type: 'GET_TRANSACTION_DATA',
  headers,
  body,
})

export const getTransactionDataSuccessed = (data, offset, limit) => ({
  type: 'GET_TRANSACTION_DATA_SUCCESS',
  data,
  offset, 
  limit,
})

export const getTransactionDataFailed = (data) => ({
  type: 'GET_TRANSACTION_DATA_FAILED',
  data,
})

export const getAddressData = (headers, body) => ({
  type: 'GET_ADDRESS_DATA',
  headers,
  body,
})

export const getAddressDataSuccessed = (data, offset, limit) => ({
  type: 'GET_ADDRESS_DATA_SUCCESS',
  data,
  offset, 
  limit,
})

export const getAddressDataFailed = (data) => ({
  type: 'GET_ADDRESS_DATA_FAILED',
  data,
})

export function signIn(body, headers, isRememberMe) {
  return function (dispatch) {
    dispatch(signInSubmit(body, headers))
    return fetch(Server.server() + 'api/users/signin', {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          sessionStorage.setItem('token', data.token)
          sessionStorage.setItem('email', data.email)
          if (isRememberMe) {
            ls('email', body.email)
            ls('password', body.password)
            ls('isRememberMe', true)
          } else {
            ls('email', '')
            ls('password', '')
            ls('isRememberMe', false)
          }
          dispatch(signInSuccessed(null))

        }
        else {
          dispatch(signInFailed(data))
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
          dispatch(signUpSuccessed(data))

        }
        else {
          dispatch(signUpFailed(data))
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

export function resetPasswordByGoogleAuth(body, headers) {
  return function (dispatch) {
    dispatch(resetPasswordByGoogleAuthSubmit(body, headers))
    return fetch(Server.server() + 'api/users/resetpassword', {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          dispatch(resetPasswordByGoogleAuthSuccessed(data))
        }
        else {
          dispatch(resetPasswordByGoogleAuthFailed(data))
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
          dispatch(getProfileSuccessed(data))
        }
        else {
          dispatch(getProfileFailed(data))
        }
      })
  }
}

export function verifyEmailByGoogleAuth(body, headers, key) {
  return function (dispatch) {
    dispatch(verifyEmailByGoogleAuthSubmit(body, headers))
    return fetch(Server.server() + 'api/users/verify/' + key, {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          dispatch(verifyEmailByGoogleAuthSuccessed(data))
        }
        else {
          dispatch(verifyEmailByGoogleAuthFailed(data))
        }
      })
  }
}

export function getVerifyQRCode(headers, key) {
  return function (dispatch) {
    console.log('key', key)
    dispatch(getQRCode(headers))
    return fetch(Server.server() + 'api/users/qrCode/' + key, {
      method: 'post',
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
                  console.log('sex', data)
        if (data.success === true) {
          console.log('sad',data)
          dispatch(getQRCodeSuccessed(data))
        }
        else {
                    console.log('sad', data)
          dispatch(getQRCodeFailed(data))
        }
      })
  }
}

export function getAdminStatisticData(headers, body, offset, limit) {
  return function (dispatch) {
    dispatch(getStatisticData(headers, body))
    return fetch(Server.server() + 'api/admin/statistics/data', {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          dispatch(getStatisticDataSuccessed(data, offset, limit))
        }
        else {
          dispatch(getStatisticDataFailed(data))
        }
      })
  }
}

export function getAdminTransactionData(headers, body, offset, limit) {
  return function (dispatch) {
    dispatch(getTransactionData(headers, body))
    return fetch(Server.server() + 'api/admin/transactions/data', {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          dispatch(getTransactionDataSuccessed(data, offset, limit))
        }
        else {
          dispatch(getTransactionDataFailed(data))
        }
      })
  }
}

export function getAdminAddressData(headers, body, offset, limit) {
  return function (dispatch) {
    dispatch(getAddressData(headers, body))
    return fetch(Server.server() + 'api/admin/addresses/data', {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers,
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success === true) {
          dispatch(getAddressDataSuccessed(data, offset, limit))
        }
        else {
          dispatch(getAddressDataFailed(data))
        }
      })
  }
}


const initialState = {
    isRedirect: sessionStorage.getItem('token') && sessionStorage.getItem('token') !== 'undefined' ? true : false,
    errorMessage: null,
    successMessage: null,
    verifiedEmail: null,
    isFetching: false,
};

const account = (state = initialState, action) => {
    switch (action.type) {
        case 'SIGN_IN':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SIGN_IN_SUCCESS':
            window.location.href = sessionStorage.getItem('previous')
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: null,
                successMessage: action.data.msg,
            })
        case 'SIGN_IN_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: null,
                errorMessage: action.data.msg,
            })
        case 'SIGN_UP':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SIGN_UP_SUCCESS':
            // window.location.href = '/verify/' + action.data.keyGoogleAuthenticator
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: null,
                successMessage: action.data.msg,
            })
        case 'SIGN_UP_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: null,
                errorMessage: action.data.msg,
            })
        case 'RESET_ERROR_MESSAGE':
            return Object.assign({}, state, {
                errorMessage: null,
                successMessage: null,
            })
        case 'RETRIEVE_PASSWORD':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'RETRIEVE_PASSWORD_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: action.errorMessage,
            })
        case 'RETRIEVE_PASSWORD_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.errorMessage,
            })
        case 'RESET_PASSWORD':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'RESET_PASSWORD_SUCCESS':
            window.location.href = '/signin'
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: action.errorMessage,
            })
        case 'RESET_PASSWORD_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.errorMessage,
            })
        case 'RESET_PASSWORD_BY_GOOGLE_AUTH':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'RESET_PASSWORD_BY_GOOGLE_AUTH_SUCCESS':
            window.location.href = '/signin'
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: action.data.msg,
                errorMessage: undefined,
            })
        case 'RESET_PASSWORD_BY_GOOGLE_AUTH_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: undefined,
                errorMessage: action.data.msg,
            })
        case 'SIGN_OUT':
            sessionStorage.removeItem('email')
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('previous')
            window.location.href = '/signin'
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'VERIFY_EMAIL_BY_GOOGLE_AUTH':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'VERIFY_EMAIL_BY_GOOGLE_AUTH_SUCCESS':
            console.log(action.data.email)
            window.location.href = '/signin'
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: null,
                successMessage: action.data.msg,
            })
        case 'VERIFY_EMAIL_BY_GOOGLE_AUTH_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: null,
                errorMessage: action.data.msg,
            })
        case 'GET_QRCODE':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_QRCODE_SUCCESS':
        console.log(action.data.qrCode)
            return Object.assign({}, state, {
                isFetching: false,
                qrCode: action.data.qrCode,
            })
        case 'GET_QRCODE_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                qrCode: undefined,
            })
        default:
            return state
    }
}

export default account

const initialState = {
    isRedirect: sessionStorage.getItem('token') && sessionStorage.getItem('token') !== 'undefined' ? true : false,
    errorMessage: null,
    successMessage: null,
    verifiedEmail: null,
    isFetching: false,
    data: {},
};

const account = (state = initialState, action) => {
    switch (action.type) {
        case 'SIGN_IN':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SIGN_IN_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                isRedirect: true,
                errorMessage: null,
            })
        case 'SIGN_IN_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                isRedirect: false,
                errorMessage: action.errorMessage,
            })
        case 'SIGN_UP':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SIGN_UP_SUCCESS':
            window.location.href = '/verify/' + action.data.keyGoogleAuthenticator
            return Object.assign({}, state, {
                isFetching: false,
                isRedirect: false,
                errorMessage: null,
                successMessage: action.errorMessage,
                data: action.data,
            })
        case 'SIGN_UP_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                isRedirect: false,
                successMessage: null,
                errorMessage: action.errorMessage,
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
        case 'SIGN_OUT':
            sessionStorage.removeItem('email')
            sessionStorage.removeItem('token')
            window.location.href = '/signin'
            return Object.assign({}, state, {
                isFetching: true,
                isRedirect: false,
            })
        case 'VERIFY_TOKEN':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'VERIFY_TOKEN_SUCCESS':
                    console.log(action.data.email)
            window.location.href = '/signin'
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: null,
                successMessage: action.data.msg,
                verifiedEmail: action.data.email,
            })
        case 'VERIFY_TOKEN_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: null,
                errorMessage: action.data.msg,
            })
        default:
            return state
    }
}

export default account

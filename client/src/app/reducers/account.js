const initialState = {
    redirect: false,
    errorMessage: null,
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
                redirect: true,
                errorMessage: null,
            })
        case 'SIGN_IN_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                redirect: false,
                errorMessage: action.errorMessage,
            })
        case 'SIGN_UP':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SIGN_UP_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                redirect: true,
                errorMessage: null,
                data: action.data,
            })
        case 'SIGN_UP_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                redirect: false,
                errorMessage: action.errorMessage,
            })
        case 'RESET_ERROR_MESSAGE':
            return Object.assign({}, state, {
                errorMessage: action.errorMessage,
            })
        case 'RETRIEVE_PASSWORD':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'RETRIEVE_PASSWORD_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.errorMessage,
            })
        case 'RETRIEVE_PASSWORD_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.errorMessage,
            })
        default:
            return state
    }
}

export default account
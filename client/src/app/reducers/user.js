const initialState = {
    userInfo: {
        welcomeMessage: null,
        email: null,
        address: null,
        realMoney: null,
        availabelMoney: null,
        token: null
    },
    isFetching: false,
    errorMessage: null,
};

const user = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_PROFILE':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_PROFILE_SUCCESS':
            return Object.assign({}, state, {
                userInfo: {
                    email: action.email,
                    address: action.address,
                    realMoney: action.realMoney,
                    availabelMoney: action.availabelMoney,
                    welcomeMessage: action.welcomeMessage,
                    token: action.token
                },
                isFetching: false,
                errorMessage: null,
            })
        case 'GET_PROFILE_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.errorMessage,
            })
        // case 'SIGN_IN_SUCCESS':
        //     return Object.assign({}, state, {
        //         isFetching: false,
        //         isRedirect: true,
        //         errorMessage: null,
        //     })
        // case 'SIGN_IN_FAILED':
        //     return Object.assign({}, state, {
        //         isFetching: false,
        //         isRedirect: false,
        //         errorMessage: action.errorMessage,
        //     })
        default:
            return state
    }
}

export default user
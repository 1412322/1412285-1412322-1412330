const initialState = {
    userInfo: {
        welcomeMessage: null,
        email: null,
        address: null,
        realMoney: null,
        availableMoney: null,
        token: null
    },
    role: undefined,
    isFetching: false,
    errorMessage: null,
    statisticData: undefined,
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
                    availableMoney: action.availableMoney,
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
        case 'CHECK_ROLE':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'CHECK_ROLE_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                statisticData: action.data
            })
        case 'CHECK_ROLE_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.data.msg,
                role: action.data.success,
            })
        default:
            return state
    }
}

export default user

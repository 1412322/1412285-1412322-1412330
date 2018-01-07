const initialState = {
    userData: undefined,
    isFetching: false,
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
                isFetching: false,
                userData: action.data,
            })
        case 'GET_PROFILE_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.data.msg,
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
                statisticData: action.data,
            })
        default:
            return state
    }
}

export default user

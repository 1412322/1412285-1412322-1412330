const initialState = {
    userData: undefined,
    isFetching: true,
    isAdmin: false,
    statisticData: undefined,
    transactionData: undefined,
    limit: undefined,
    offset: undefined,
    pageCount: undefined,
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
                isAdmin: action.data.success,
                statisticData: action.data,
                pageCount: Math.ceil(action.data.totalUser / action.limit),
                offset: action.data.offset,
            })
        case 'CHECK_ROLE_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                statisticData: action.data,
            })
        case 'GET_TRANSACTION_DATA':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_TRANSACTION_DATA_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                isAdmin: action.data.success,
                transactionData: action.data,
                pageCount: Math.ceil(10 / action.limit),
                offset: action.data.offset,
            })
        case 'GET_TRANSACTION_DATA_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                transactionData: action.data,
            })
        default:
            return state
    }
}

export default user

const initialState = {
    userData: undefined,
    isFetching: true,
    statisticData: undefined,
    transactionData: undefined,
    addressData: undefined,
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
                userData: undefined,
            })
        case 'GET_STATISTIC_DATA':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_STATISTIC_DATA_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                statisticData: action.data,
                pageCount: Math.ceil(action.data.totalUser / action.limit),
            })
        case 'GET_STATISTIC_DATA_FAILED':
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
                transactionData: action.data,
                pageCount: Math.ceil(action.data.total / action.limit),
            })
        case 'GET_TRANSACTION_DATA_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                transactionData: action.data,
            })
        case 'GET_ADDRESS_DATA':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_ADDRESS_DATA_SUCCESS':
            return Object.assign({}, state, {
                addressData: action.data,
                pageCount: Math.ceil(action.data.total / action.limit),
                isFetching: false,
            })
        case 'GET_ADDRESS_DATA_FAILED':
            return Object.assign({}, state, {
                addressData: action.data,
                isFetching: false,
            })
        default:
            return state
    }
}

export default user

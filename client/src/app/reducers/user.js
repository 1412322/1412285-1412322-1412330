const initialState = {
    userData: undefined,
    isFetching: true,
    // isAdmin: false,
    statisticData: undefined,
    transactionData: undefined,
    addressData: undefined,
    // limit: undefined,
    // offset: undefined,
    pageCount: undefined,
};

const user = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_PROFILE':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_PROFILE_SUCCESS':
        console.log(action.data)
            return Object.assign({}, state, {
                isFetching: false,
                userData: action.data,
            })
        case 'GET_PROFILE_FAILED':
        console.log(action.data)
            return Object.assign({}, state, {
                isFetching: false,
                userData: undefined,
            })
        case 'CHECK_ROLE':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'CHECK_ROLE_SUCCESS':
            return Object.assign({}, state, {
                isFetching: false,
                // isAdmin: action.data.success,
                statisticData: action.data,
                pageCount: Math.ceil(action.data.totalUser / action.limit),
                // offset: action.data.offset,
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
                // isAdmin: action.data.success,
                transactionData: action.data,
                pageCount: Math.ceil(action.data.total / action.limit),
                // offset: action.data.offset,
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

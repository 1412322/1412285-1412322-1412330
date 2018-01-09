const initialState = {
    isFetching: false,
    historyData: undefined,
    isDeleted: false,
};

const transaction = (state = initialState, action) => {
    switch (action.type) {
        case 'SEND_MONEY':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SEND_MONEY_SUCCESS':
            console.log('asdas', action.data)
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: action.data.msg,
            })
        case 'SEND_MONEY_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.data.msg,
            })
        case 'GET_HISTORY_DATA':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'GET_HISTORY_DATA_SUCCESS':
            console.log(action.data)
            return Object.assign({}, state, {
                isFetching: false,
                historyData: action.data,
            })
        case 'GET_HISTORY_DATA_FAILED':
            return Object.assign({}, state, {
                isFetching: false,
                historyData: action.data,
            })
        case 'DELETE_TRANSACTION':
            return Object.assign({}, state, {
                isDeleted: true,
            })
        case 'DELETE_TRANSACTION_SUCCESS':
            console.log(action.data)
            return Object.assign({}, state, {
                isDeleted: false,
            })
        case 'DELETE_TRANSACTION_FAILED':
            return Object.assign({}, state, {
                isDeleted: false,
            })
        default:
            return state
    }
}

export default transaction

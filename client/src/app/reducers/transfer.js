const initialState = {
    error: null,
    money: null,
    transfersList: [],
    transfersSortList: [],
}

const transfer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_TRANSFER_MONEY_ERROR_MESSAGE':
            return {
                ...state,
                error: action.error
            }
        case 'GET_CURRENT_MONEY':
            return {
                ...state,
                money: action.money
            }
        case 'GET_TRANSFERS_LIST':
            return {
                ...state,
                transfersList: action.transfersList
            }
        case 'GET_TRANSFERS_SORT_LIST':
            return {
                ...state,
                transfersSortList: action.transfersSortList
            }
        default:
            return state
    }
}

export default transfer
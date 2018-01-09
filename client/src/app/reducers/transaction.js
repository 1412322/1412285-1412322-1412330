const initialState = {
    isFetching: false,
    errorMessage: undefined,
    successMessage: undefined,
};

const transaction = (state = initialState, action) => {
    switch (action.type) {
        case 'SEND_MONEY':
            return Object.assign({}, state, {
                isFetching: true,
            })
        case 'SEND_MONEY_SUCCESS':
        console.log(action.data)
            return Object.assign({}, state, {
                isFetching: false,
                successMessage: action.data.msg,
            })
        case 'SEND_MONEY_FAILED':
        console.log(action.data)
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.data.msg,
            })
        default:
            return state
    }
}

export default transaction

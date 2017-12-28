const initialState = {
    error: null,
    isRedirect: false
};

const authen = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_AUTHEN_ERROR_MESSAGE':
            return {
                ...state,
                error: action.error,
                isRedirect: action.isRedirect
            }
        default:
            return state
    }
}

export default authen
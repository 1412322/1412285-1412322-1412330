export const getAuthenErrorMessage = (error, isRedirect) => {
    return {
        type: 'GET_AUTHEN_ERROR_MESSAGE',
        error,
        isRedirect
    }
}

export const getTransferMoneyErrorMessage = (error) => {
    return {
        type: 'GET_TRANSFER_MONEY_ERROR_MESSAGE',
        error
    }
}

export const getCurrentMoney = (money) => {
    return {
        type: 'GET_CURRENT_MONEY',
        money
    }
}

export const getTransfersList = (transfersList) => {
    return {
        type: 'GET_TRANSFERS_LIST',
        transfersList
    }
}

export const getTransfersSortList = (transfersSortList) => {
    return {
        type: 'GET_TRANSFERS_SORT_LIST',
        transfersSortList
    }
}
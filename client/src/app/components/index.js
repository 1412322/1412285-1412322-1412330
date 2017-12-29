import React from 'react'
import { connect } from 'react-redux'
import * as walletManagementActions from '../actions'
import { bindActionCreators } from 'redux'
import Content from './layouts/content.js'

class App extends React.Component {
    render() {
        return (
            <Content />
        )
    }
}

const mapStateToProps = (state) => {
    return {
        money: state.transfer.money,
        transfersSortList: state.transfer.transfersSortList,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        walletManagementActions: bindActionCreators(walletManagementActions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)

// module.exports = App
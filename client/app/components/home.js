import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import * as walletManagementActions from '../actions'
import { bindActionCreators } from 'redux'
import { Table, Header } from 'semantic-ui-react'

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            TransfersSortList: [],
        }
    }

    componentWillMount() {
        this.getWalletInfo()
    }

    // componentWillReceiveProps(nextProps) {
    //     if (this.props.transfersSortList !== nextProps.transfersSortList) {
    //         this.setState({ TransfersSortList: nextProps.transfersSortList })
    //     }
    // }

    getWalletInfo = () => {
        let headers = {}
        const { walletManagementActions } = this.props
        if (sessionStorage.getItem('token') === null) {
            headers = {
                'Content-Type': 'application/json'
            }
        }
        else {
            headers = {
                'Content-Type': 'application/json',
                'authorization': sessionStorage.getItem('token')
            }
        }
        fetch('api/wallet/info', {
            method: 'get',
            headers: headers,
        })
        .then(res => res.json())
        .then((data) => {
            if (data.success === true) {
                this.getListExchange(headers, data.wallet)
                walletManagementActions.getCurrentMoney(data.wallet.money)
            }
        })
    }

    getListExchange = (headers, ownerInfo) => {
        fetch('api/transfers/list', {
            method: 'get',
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                if (data.success === true) {
                    const TransfersSortList = []
                    const { walletManagementActions } = this.props
                    for (let i = data.transfers.length - 1; i >= 0; i--) {
                        const dataExchange = data.transfers[i]
                        if (data.transfers[i].send === ownerInfo._id) {
                            fetch('api/wallet/infobyid/' + dataExchange.receive, {
                                method: 'get',
                                headers: headers,
                            })
                            .then(res => res.json())
                            .then((data) => {
                                if (data.success === true) {
                                    const exchangeDetail = {
                                        send: ownerInfo.email,
                                        money: dataExchange.money,
                                        receive: data.wallet.email
                                    }
                                    // const TransfersSortList = this.props.transfersSortList
                                    TransfersSortList.push(exchangeDetail)
                                    walletManagementActions.getTransfersSortList(TransfersSortList)
                                    this.setState({
                                        TransfersSortList: this.props.transfersSortList
                                    })
                                }
                    
                            })
                        }
                        if (data.transfers[i].receive === ownerInfo._id) {
                            fetch('api/wallet/infobyid/' + dataExchange.send, {
                                method: 'get',
                                headers: headers,
                            })
                            .then(res => res.json())
                            .then((data) => {
                                if (data.success === true) {
                                    const exchangeDetail = {
                                        send: data.wallet.email,
                                        money: dataExchange.money,
                                        receive: ownerInfo.email
                                    }
                                    // const TransfersSortList = this.props.transfersSortList
                                    TransfersSortList.push(exchangeDetail)
                                    walletManagementActions.getTransfersSortList(TransfersSortList)
                                    this.setState({
                                        TransfersSortList: this.props.transfersSortList
                                    })
                                }
                            })
                        }
                    }
                }
            })
    }

    render() {
        const dataTable = this.state.TransfersSortList.map((value, i) => {
            return (
                <Table.Row key={i}>
                    <Table.Cell>{value.send}</Table.Cell>
                    <Table.Cell>{value.receive}</Table.Cell>
                    <Table.Cell>{value.money}</Table.Cell>
                </Table.Row>
            )
        })
        return (
            !sessionStorage.getItem('token')
                ? <Redirect to='/signin' />
                : (<div>
                    <Header as='h2' textAlign='center'>
                        Recent Transactions
                </Header>
                    Wallet: {this.props.money}
                    <Table basic>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Sender</Table.HeaderCell>
                                <Table.HeaderCell>Receiver</Table.HeaderCell>
                                <Table.HeaderCell>Money</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {dataTable}
                        </Table.Body>
                    </Table>
                </div>)
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
)(Home)

// module.exports = Home
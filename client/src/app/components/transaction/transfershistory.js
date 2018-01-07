import React from 'react'
import ReactDOM from 'react-dom'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import * as walletManagementActions from '../../actions'
import { bindActionCreators } from 'redux'
import { Table, Header } from 'semantic-ui-react'

class TransfersHistory extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            transfersList: [],
        }
    }

    componentWillMount() {
        this.getWalletInfo()
    }

    // componentWillReceiveProps(nextProps) {
    //     if (this.props.transfersList !== nextProps.transfersList) {
    //         console.log(nextProps.transfersList)
    //         this.setState({ transfersList: nextProps.transfersList })
    //     }
    // }

    getWalletInfo = () => {
        const { walletManagementActions } = this.props
        let headers = {}
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
                    this.getListTransfersSender(headers, data.wallet)
                    this.getListTransfersReceiver(headers, data.wallet)
                    walletManagementActions.getCurrentMoney(data.wallet.money)
                }
            })
    }

    getListTransfersSender = (headers, sendInfo) => {
        fetch('api/transfers/senderlist/' + sendInfo._id, {
            method: 'get',
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                if (data.success === true) {
                    const transfersList = []
                    const { walletManagementActions } = this.props
                    for (let i = 0; i < data.transfers.length; i++) {
                        const receiverId = data.transfers[i].receive
                        const money = data.transfers[i].money
                        fetch('api/wallet/infobyid/' + receiverId, {
                            method: 'get',
                            headers: headers,
                        })
                            .then(res => res.json())
                            .then((data) => {
                                if (data.success === true) {
                                    const transfersDetail = {
                                        send: sendInfo.email,
                                        money: money,
                                        receive: data.wallet.email
                                    }
                                    // const transfersList = this.props.transfersList
                                    transfersList.push(transfersDetail)
                                    walletManagementActions.getTransfersList(transfersList)
                                    this.setState({ transfersList: this.props.transfersList})
                                }
                            })
                    }
                }
            })
    }

    getListTransfersReceiver = (headers, receiveInfo) => {
        fetch('api/transfers/receiverlist/' + receiveInfo._id, {
            method: 'get',
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                if (data.success === true) {
                    const transfersList = []
                    const { walletManagementActions } = this.props
                    for (let i = 0; i < data.transfers.length; i++) {
                        const senderId = data.transfers[i].send
                        const money = data.transfers[i].money
                        fetch('api/wallet/infobyid/' + senderId, {
                            method: 'get',
                            headers: headers,
                        })
                            .then(res => res.json())
                            .then((data) => {
                                if (data.success === true) {
                                    const transfersDetail = {
                                        send: data.wallet.email,
                                        money: money,
                                        receive: receiveInfo.email
                                    }
                                    // const transfersList = this.props.transfersList
                                    transfersList.push(transfersDetail)
                                    walletManagementActions.getTransfersList(transfersList)
                                    this.setState({ transfersList: this.props.transfersList})
                                }
                            })
                    }
                }
            })
    }

    render() {
        const { transfersList } = this.state
        const dataTable = transfersList.map((value, i) => {
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
                        Transactions List
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
        error: state.transfer.error,
        money: state.transfer.money,
        transfersList: state.transfer.transfersList,
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
)(TransfersHistory)

// module.exports = TransfersHistory

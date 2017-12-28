import React from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import * as walletManagementActions from '../../actions'
import { bindActionCreators } from 'redux'
import isEmpty from 'validator/lib/isEmpty'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

class Transfers extends React.Component {
    constructor(props) {
        super(props)
        // this.transfers = this.transfers.bind(this)
        // this.checkMoney = this.checkMoney.bind(this)
        // this.checkReceiver = this.checkReceiver.bind(this)
        // this.createTransfers = this.createTransfers.bind(this)
        // this.state = {
        //     email: null,
        //     token: sessionStorage.getItem('token'),
        //     redirect: false,
        //     msg: null,
        //     redirectToHome: false,
        // }
    }
    componentWillMount() {
        if (sessionStorage.getItem('token') === null) {
            this.setState({
                redirect: true
            })
        }
    }
    transfers = () => {
        const { walletManagementActions } = this.props
        if (isEmpty($("#receiveremail").val()) || isEmpty($("#money").val())) {
            walletManagementActions.getTransferMoneyErrorMessage(8)
        }
        else if ($("#receiveremail").val() === sessionStorage.getItem('email')) {
            walletManagementActions.getTransferMoneyErrorMessage(9)
        }
        else {
            var headers = {
                'Content-Type': 'application/json',
                'authorization': sessionStorage.getItem('token')
            }
            this.checkMoney(headers)
        }
    }
    checkMoney = (headers) => {
        const { walletManagementActions } = this.props
        var money = 0
        money = $("#money").val()
        fetch('api/wallet/info', {
            method: 'get',
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                console.log(data)
                if (data.success === true) {
                    if (money > data.wallet.money) {
                        walletManagementActions.getTransferMoneyErrorMessage(10)
                        // this.setState({
                        //     msg: 'You do not have enough money.'
                        // })
                    }
                    else {
                        this.checkReceiver(headers, data.wallet)
                    }
                }
                else {
                    walletManagementActions.getTransferMoneyErrorMessage(data.msg)
                    // this.setState({
                    //     msg: data.msg
                    // })
                }
            })
    }

    checkReceiver = (headers, send) => {
        const { walletManagementActions } = this.props
        var receiver = {
            "email": $("#receiveremail").val()
        }
        fetch('api/wallet/infobyemail', {
            method: 'post',
            headers: headers,
            body: JSON.stringify(receiver),
        })
            .then(res => res.json())
            .then((data) => {
                if (data.success === true) {
                    this.createTransfers(headers, send, data.wallet)
                    var money = 0
                    money = send.money - $("#money").val()
                    var bodySend = {
                        "id": send._id,
                        "email": send.email,
                        "money": money
                    }
                    var moneyreceive = 0
                    moneyreceive = data.wallet.money + parseInt($("#money").val())
                    var bodyReceive = {
                        "id": data.wallet._id,
                        "email": data.wallet.email,
                        "money": moneyreceive
                    }
                    console.log('bodyReceive:', bodyReceive)
                    this.updateWalletSend(headers, bodySend)
                    this.updateWalletReceive(headers, bodyReceive)
                    walletManagementActions.getTransferMoneyErrorMessage(null)
                    alert('Money was sent successfully.')
                    // this.setState({
                    // this.setState({
                    //     redirectToHome: true
                    // })
                }
                else {
                    walletManagementActions.getTransferMoneyErrorMessage(11)
                    // this.setState({
                    //     msg: 'Receiver not found.'
                    // })
                }
            })
    }
    createTransfers = (headers, send, receive) => {
        var body = {
            "send": send._id,
            "receive": receive._id,
            "money": $("#money").val()
        }
        fetch('api/transfers/create', {
            method: 'post',
            body: JSON.stringify(body),
            headers: headers,
        })
            .then(res3 => res3.json())
            .then((data3) => {
                console.log(data3)
                /*this.setState({
                  redirect: true
                })*/

            })
    }

    updateWalletSend = (headers, bodySend) => {
        fetch('api/wallet/update', {
            method: 'put',
            body: JSON.stringify(bodySend),
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                console.log(data)

            })
    }

    updateWalletReceive = (headers, bodyReceive) => {
        fetch('api/wallet/update', {
            method: 'put',
            body: JSON.stringify(bodyReceive),
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                console.log(data)

            })
    }
    render() {
        const { error } = this.props
        return (
            !sessionStorage.getItem('token')
                ? <Redirect to='/signin' />
                : (<Grid
                    textAlign='center'
                    style={{ height: '100%' }}
                    verticalAlign='middle'
                >
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as='h2' textAlign='center'>
                            Transfers Money
                    </Header>
                        <Form size='large'>
                            <Form.Input
                                fluid
                                icon='user'
                                iconPosition='left'
                                placeholder='Enter Receiver Email'
                                id='receiveremail'
                            />
                            <Form.Input
                                fluid
                                icon='dollar'
                                iconPosition='left'
                                placeholder='Enter Money'
                                type='text'
                                id='money'
                            />
                            {(error !== null && error !== 13)
                                && (<Message negative>
                                    {error === 8 && 'Receriver Email and Money must not be empty.'}
                                    {error === 9 && 'You can not send money to yourself.'}
                                    {error === 10 && 'You do not have enough money.'}
                                    {error === 11 && 'Receiver not found.'}
                                    {error === 12 && 'Wallet not found.'}
                                </Message>)}
                            {/* {message === 13
                            && (<Message color='green'>
                                Money was sent successfully.
                            </Message>)} */}
                            <Button className='submit-button' fluid size='large' onClick={this.transfers}>Send</Button>
                        </Form>
                    </Grid.Column>
                </Grid>)
        )
    }
}

const mapStateToProps = (state) => {
    return {
        error: state.transfer.error,
        // isRedirect: state.authen.isRedirect,
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
)(Transfers)

// module.exports = Transfers

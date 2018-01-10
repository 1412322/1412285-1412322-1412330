import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header, Input, Button, Statistic } from 'semantic-ui-react'
import * as actions from '../../actions'
import validator from 'validator'
import * as _ from 'lodash'
// import RequirementIcon from 'react-icons/lib/md/info-outline'

class TransferContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            // token: sessionStorage.getItem('token'),
            receiverAddress: '',
            numberOfCoinsTransfer: '',
            errors: [{
                field: '',
            }],
        }
    }

    componentWillMount() {
        sessionStorage.setItem('previous', this.props.location.pathname)
    }

    onSubmitForm(e) {
        e.preventDefault()
        // const { actions } = this.props
        // const { fullname, receiverAddress, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            const { receiverAddress, numberOfCoinsTransfer } = this.state
            const { actions, userData } = this.props
            const headers = {
                'Content-Type': 'application/json',
                authorization: userData.token,
            }
            const body = {
                "sendMoney": validator.toInt(numberOfCoinsTransfer, 10),
                "destination": receiverAddress,
            }
            actions.transferMoney(body, headers)
        }
    }

    onValidateForm() {
        const { receiverAddress, numberOfCoinsTransfer } = this.state
        const errors = []
        if (_.isEmpty(receiverAddress)) {
            errors.push({ field: 'receiverAddress' })
        }

        if (_.isEmpty(numberOfCoinsTransfer)) {
            errors.push({ field: 'numberOfCoinsTransfer' })
        } else if (!validator.isNumeric(numberOfCoinsTransfer)) {
            errors.push({ field: 'numberOfCoinsTransfer' })
        }

        this.setState({
            errors: errors,
        })

        return errors
    }

    onHandleChange(event, fieldName) {
        const target = event.target
        const value = target.value
        this.setState({
            [fieldName]: value,
        })
    }

    render() {
        const { receiverAddress, numberOfCoinsTransfer, errors } = this.state
        const { errorMessage, successMessage, isFetching, userData } = this.props
        return (
            <Container className='transferContainer'>
                <div className='transferContainerHeader'>
                    <Header as='h2' textAlign='center' >Coins Transfer</Header>
                </div>
                <div className='transferContainerBody'>
                    <div className='containerHeader'>
                        <Statistic size='mini'>
                            <Statistic.Label>Actual Balance</Statistic.Label>
                            <Statistic.Value>{userData.realMoney}</Statistic.Value>
                        </Statistic>
                        <Statistic size='mini'>
                            <Statistic.Label>Available Balance</Statistic.Label>
                            <Statistic.Value>{userData.availableMoney}</Statistic.Value>
                        </Statistic>
                    </div>
                    <div className='containerBody'>
                        <Input
                            className={
                                _.find(errors, { field: 'receiverAddress' })
                                    ? 'normal-field error-field'
                                    : 'normal-field'
                            }
                            fluid={true}
                            label={<label>Receiver Address</label>}
                            onChange={(e) => this.onHandleChange(e, 'receiverAddress')}
                            type='text'
                            value={receiverAddress} />
                        <Input
                            className={
                                _.find(errors, { field: 'numberOfCoinsTransfer' })
                                    ? 'normal-field error-field'
                                    : 'normal-field'
                            }
                            fluid={true}
                            label={<label>Coins</label>}
                            onChange={(e) => this.onHandleChange(e, 'numberOfCoinsTransfer')}
                            type='text'
                            value={numberOfCoinsTransfer} />
                    </div>

                    <div className='containerFooter'>
                        <span
                            className='error-message'
                            style={
                                (errorMessage !== null)
                                    ? { display: 'block' }
                                    : { display: 'none' }
                            }>
                            {errorMessage}
                        </span>
                        <span
                            className='success-message'
                            style={
                                (successMessage !== null)
                                    ? { display: 'block' }
                                    : { display: 'none' }
                            }>
                            {successMessage}
                        </span>
                        <Button loading={isFetching} type='submit' className='accept-btn' onClick={(e) => this.onSubmitForm(e)} >Transfer</Button>
                    </div>

                </div>
            </Container>
        )
    }
}

TransferContainer.propTypes = {
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.transaction.errorMessage,
        successMessage: state.transaction.successMessage,
        isFetching: state.transaction.isFetching,
        userData: state.user.userData,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            transferMoney: actions.transferMoney,
            // resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferContainer)

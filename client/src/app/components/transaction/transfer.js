import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header, Input, Button, Popup } from 'semantic-ui-react'
import * as actions from '../../actions'
import validator from 'validator'
import * as _ from 'lodash'
import RequirementIcon from 'react-icons/lib/md/info-outline'

class TransferContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            receiverAddress: '',
            numberOfCoinsTransfer: '',
            errors: [{
                field: '',
            }],
        }
    }

    componentWillMount() {
        const { token } = this.state
        const { actions } = this.props
        const headers = {
            authorization: token,
            'Content-Type': 'application/json'
        }
          // actions.getUserProfile(headers)
    }

    onSubmitForm(e) {
        e.preventDefault()
        // const { actions } = this.props
        // const { fullname, receiverAddress, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            const { receiverAddress, numberOfCoinsTransfer, verifyToken } = this.state
            const { actions } = this.props
            const headers = {
                'Content-Type': 'application/json'
            };
            const body = {
                "receiverAddress": receiverAddress,
                "numberOfCoinsTransfer": numberOfCoinsTransfer,
                "verifyToken": verifyToken,
            };
            actions.signIn(body, headers)
        }
    }

    onValidateForm() {
        const { receiverAddress, numberOfCoinsTransfer } = this.state
        const errors = []
        if (_.isEmpty(receiverAddress)) {
            errors.push({ field: 'receiverAddress' })
        }

        if (_.isEmpty(receiverAddress)) {
            errors.push({ field: 'numberOfCoinsTransfer' })
        }

        this.setState({
            errors: errors,
        })

        return errors
    }

    render() {
        const { receiverAddress, numberOfCoinsTransfer, errors } = this.state
        const { errorMessage, successMessage } = this.props
        return (
            <Container className='transferContainer'>
                <div className='transferContainerHeader'>
                    <Header as='h2' textAlign='center' >Coins Transfer</Header>
                </div>
                <div className='transferContainerBody'>
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
                            value={receiverAddress} />
                    </div>

                    <div className='containerFooter'>
                        <Button type='submit' className='submit-btn' onClick={(e) => this.onSubmitForm(e)} >Transfer</Button>
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
        errorMessage: state.account.errorMessage,
        successMessage: state.account.successMessage,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            // signIn: accountActions.signIn,
            // resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferContainer)

import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header, Input, Button, Statistic } from 'semantic-ui-react'
import * as actions from '../../actions'
import validator from 'validator'
import * as _ from 'lodash'
// import RequirementIcon from 'react-icons/lib/md/info-outline'

class VerifyContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            verifyCode: '',
            // numberOfCoinsTransfer: '',
            errors: [{
                field: '',
            }],
        }
    }

    onSubmitForm(e, verifyValue) {
        e.preventDefault()
        // const { actions } = this.props
        // const { fullname, verifyCode, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            const { verifyCode } = this.state
            const { actions, userData } = this.props
            const headers = {
                'Content-Type': 'application/json',
                authorization: userData.token,
            }
            const body = {
                "verifyToken": verifyCode,
                "verifyValue": verifyValue,
            }
            actions.verifyTransfer(headers, body, this.props.match.params.key)
        }
    }

    onValidateForm() {
        const { verifyCode } = this.state
        const errors = []
        if (_.isEmpty(verifyCode)) {
            errors.push({ field: 'verifyCode' })
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
        const { verifyCode, errors } = this.state
        const { errorMessage, successMessage, isSubmit } = this.props
        return (
            <Container className='transferContainer'>
                <div className='transferContainerHeader'>
                    <Header as='h2' textAlign='center' >Verify Transfer</Header>
                </div>
                <div className='transferContainerBody'>
                    Please enter Verify Token from your Google Authenticator Application to confirm this transfer.
                    <div className='containerBody'>
                        <Input
                            className={
                                _.find(errors, { field: 'verifyCode' })
                                    ? 'normal-field error-field'
                                    : 'normal-field'
                            }
                            fluid={true}
                            label={<label>Verify Token</label>}
                            onChange={(e) => this.onHandleChange(e, 'verifyCode')}
                            type='text'
                            value={verifyCode} />
                        {/* <Input
                            className={
                                _.find(errors, { field: 'numberOfCoinsTransfer' })
                                    ? 'normal-field error-field'
                                    : 'normal-field'
                            }
                            fluid={true}
                            label={<label>Coins</label>}
                            onChange={(e) => this.onHandleChange(e, 'numberOfCoinsTransfer')}
                            type='text'
                            value={numberOfCoinsTransfer} /> */}
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
                        <Button loading={isSubmit} type='submit' className='cancel-btn' onClick={(e) => this.onSubmitForm(e, false)}>Cancel</Button>
                        <Button loading={isSubmit} type='submit' className='accept-btn' onClick={(e) => this.onSubmitForm(e, true)}>Accept</Button>
                    </div>

                </div>
            </Container>
        )
    }
}

VerifyContainer.propTypes = {
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.transaction.errorMessage,
        successMessage: state.transaction.successMessage,
        isSubmit: state.transaction.isSubmit,
        userData: state.user.userData,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            verifyTransfer: actions.verifyTransfer,
            // resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyContainer)

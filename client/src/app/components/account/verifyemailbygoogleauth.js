import React from 'react'
import { Button, Form, Input, Header, Image } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as accountActions from '../../actions'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import './styles.scss'
// import { Link } from 'react-router-dom'
// import validator from 'validator'
import { Redirect } from 'react-router-dom'
class VerifyEmailByGoogleAuthContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            authKey: '',
            verifyToken: '',
            errors: [{
                field: '',
            }],
        }
    }

    componentWillMount() {
        const { actions } = this.props
        const headers = {
            'Content-Type': 'application/json'
        };
        actions.getVerifyQRCode(headers, this.props.match.params.key)
        this.setState({
          authKey: this.props.match.params.key,
        })
    }

    onSubmitForm(e) {
        e.preventDefault()
        // const { actions } = this.props
        // const { fullname, authKey, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            const { verifyToken, authKey } = this.state
            const { actions } = this.props
            const headers = {
                'Content-Type': 'application/json'
            };
            const body = {
                "verifyToken": verifyToken,
            };
            actions.verifyEmailByGoogleAuth(body, headers, authKey)
        }
    }


    onValidateForm() {
        const { verifyToken } = this.state
        const errors = []
        if (_.isEmpty(verifyToken)) {
            errors.push({ field: 'verifyToken' })
        }
        this.setState({
            errors: errors,
        })

        return errors
    }

    onHandleChange(event, fieldName) {
        const { actions } = this.props
        const target = event.target
        const value = target.value
        actions.resetErrorMessage()
        this.setState({
            [fieldName]: value,
        })
    }

    render() {
        const { token, verifyToken, authKey, errors } = this.state
        const { errorMessage, successMessage, qrCode } = this.props
        console.log(qrCode)
        return (
            token && token !== 'undefined'
            ? <Redirect to="/" />
            : (<div className='account-container'>
                <div className='dialog'>
                    <Form className='form' onSubmit={(e) => this.onSubmitForm(e)}>
                        <div className='form-header'>
                            <Header as='h2' textAlign='center' >Get Google Authenticator Key</Header>
                        </div>
                        <div className='form-body'>
                            Please enter below key into your <span style={{ color: '#7ed321' }}>Google Authenticator Application</span> to get Verify Token.
                            <Image src={qrCode} centered={true} />
                            <p>{authKey}</p>
                            <Input
                                className={
                                    _.find(errors, { field: 'verifyToken' })
                                        ? 'normal-field error-field'
                                        : 'normal-field'
                                }
                                fluid={true}
                                label={<label>Verify Token</label>}
                                onChange={(e) => this.onHandleChange(e, 'verifyToken')}
                                type='text'
                                value={verifyToken} />
                        </div>
                        <div className='form-footer'>
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
                            <Button type='submit' className='submit-btn' onClick={(e) => this.onSubmitForm(e)} >VERIFY</Button>
                            <div className='center-message'>Note: This Verify Token will be reset automatically every 30s</div>
                        </div>
                    </Form>
                </div>
            </div>)
        )
    }
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.account.errorMessage,
        successMessage: state.account.successMessage,
        qrCode: state.account.qrCode,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            verifyEmailByGoogleAuth: accountActions.verifyEmailByGoogleAuth,
            getVerifyQRCode: accountActions.getVerifyQRCode,
            resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VerifyEmailByGoogleAuthContainer)

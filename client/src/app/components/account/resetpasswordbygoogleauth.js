import React from 'react'
import { Button, Form, Input, Header, Popup } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as accountActions from '../../actions'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import './styles.scss'
import { Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
import RequirementIcon from 'react-icons/lib/md/info-outline'
import RightIcon from 'react-icons/lib/md/check'
import validator from 'validator'
class ResetPasswordByGoogleAuthContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            email: '',
            password: '',
            confirmPassword: '',
            verifyToken: '',
            isShowPassword: false,
            errors: [{
                field: '',
            }],
        }
    }

    componentWillMount() {
        const { actions } = this.props
        actions.resetErrorMessage()
    }

    onShowPassword = () => {
        this.setState({
            isShowPassword: true,
        })
    }

    onHidePassword = () => {
        this.setState({
            isShowPassword: false,
        })
    }

    onSubmitForm(e) {
        e.preventDefault()
        // const { actions } = this.props
        // const { fullname, email, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            const { email, password, verifyToken } = this.state
            const { actions } = this.props
            const headers = {
                'Content-Type': 'application/json'
            };
            const body = {
                "email": email,
                "password": password,
                "verifyToken": verifyToken,
            };
            actions.resetPasswordByGoogleAuth(body, headers)
        }
    }


    onValidateForm() {
        const { email, password, confirmPassword, verifyToken } = this.state
        const errors = []
        if (_.isEmpty(email)) {
            errors.push({ field: 'email' })
        } else if (!validator.isEmail(email, { allow_utf8_local_part: false })) {
            errors.push({ field: 'email' })
        }

        if (_.isEmpty(password)) {
            errors.push({ field: 'password' })
        } else if (password.length < 8) {
            errors.push({ field: 'password' })
        }
        if (_.isEmpty(confirmPassword)) {
            errors.push({ field: 'confirmPassword' })
        } else if (!validator.equals(confirmPassword, password)) {
            errors.push({ field: 'confirmPassword' })
            errors.push({ field: 'password' })
        }

        if (_.isEmpty(verifyToken)) {
            errors.push({ field: 'verifyToken' })
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
        const { token, email, password, confirmPassword, verifyToken, isShowPassword, errors } = this.state
        const { errorMessage } = this.props
        return (
          token && token !== 'undefined'
              ? <Redirect to="/" />
              : (<div className='account-container'>
                <div className='dialog'>
                    <Form className='form' onSubmit={(e) => this.onSubmitForm(e)}>
                        <div className='form-header'>
                            <Header as='h2' textAlign='center' >Reset password</Header>
                        </div>
                        <div className='form-body'>
                            <Input
                                className={
                                    _.find(errors, { field: 'email' })
                                        ? 'normal-field error-field'
                                        : 'normal-field'
                                }
                                fluid={true}
                                label={<label>Email address</label>}
                                onChange={(e) => this.onHandleChange(e, 'email')}
                                type='email'
                                value={email} />
                            <Input
                                action={
                                    <Button
                                        className='show-password-btn'
                                        onMouseDown={this.onShowPassword}
                                        onMouseUp={this.onHidePassword}
                                        type='button'>
                                        SHOW
                                    </Button>
                                }
                                className={
                                    _.find(errors, { field: 'password' })
                                        ? 'normal-field error-field'
                                        : 'normal-field'
                                }
                                id='password'
                                fluid={true}
                                label={
                                    <label>
                                        Password
                                        <Popup
                                            className='tooltip'
                                            content={
                                                <p>
                                                    <RightIcon size={10} color='#7ed321' /> At least 8 characters
                                                </p>
                                            }
                                            hideOnScroll={true}
                                            hoverable={true}
                                            offset={18}
                                            position='top center'
                                            trigger={
                                                <RequirementIcon size={15} color='#ff6868' />
                                            }
                                        />
                                    </label>
                                }
                                onChange={(e) => this.onHandleChange(e, 'password')}
                                type={isShowPassword ? 'text' : 'password'}
                                value={password} />
                            <Input
                                className={
                                    _.find(errors, { field: 'confirmPassword' })
                                        ? 'normal-field error-field'
                                        : 'normal-field'
                                }
                                fluid={true}
                                label={
                                    <label>
                                        Confirm password
                                        <Popup
                                            className='tooltip'
                                            content={
                                                <p>
                                                    <RightIcon size={10} color='#7ed321' /> At least 8 characters
                                                </p>
                                            }
                                            hideOnScroll={true}
                                            hoverable={true}
                                            offset={18}
                                            position='top center'
                                            trigger={
                                                <RequirementIcon size={15} color='#ff6868' />
                                            }
                                        />
                                    </label>
                                }
                                onChange={(e) => this.onHandleChange(e, 'confirmPassword')}
                                type='password'
                                value={confirmPassword} />
                            <Input
                                className={
                                    _.find(errors, { field: 'verifyToken' })
                                        ? 'normal-field error-field'
                                        : 'normal-field'
                                }
                                fluid={true}
                                label={
                                    <label>
                                        Verify Token
                                        <Popup
                                            className='tooltip'
                                            content={
                                                <p>Get this code from your Google Authenticator Application.</p>
                                            }
                                            hideOnScroll={true}
                                            hoverable={true}
                                            offset={26}
                                            style={{ width: 'auto' }}
                                            position='top center'
                                            trigger={
                                                <RequirementIcon size={15} color='#ff6868' />
                                            }
                                        />
                                    </label>
                                }
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
                            <Button type='submit' className='submit-btn' onClick={(e) => this.onSubmitForm(e)} >RESET</Button>
                            <div className='center-message' >Remember now? <Link to='/signin'>back to sign in.</Link></div>
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
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            resetPasswordByGoogleAuth: accountActions.resetPasswordByGoogleAuth,
            resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResetPasswordByGoogleAuthContainer)

// module.exports = ResetPasswordByGoogleAuthContainer

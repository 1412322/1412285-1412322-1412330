import React from 'react'
import { Button, Form, Input, Header, Grid, Popup } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as accountActions from '../../actions'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import './styles.scss'
import { Link } from 'react-router-dom'
import validator from 'validator'
import { Redirect } from 'react-router-dom'
import RequirementIcon from 'react-icons/lib/md/info-outline'
// import RightIcon from 'react-icons/lib/md/check'
class LoginContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            email: '',
            password: '',
            verifyToken: '',
            // isRememberMe: isRememberMe,
            isShowPassword: false,
            errors: [{
                field: '',
            }],
        }
    }

    componentWillMount() {
        const { actions } = this.props
        actions.resetErrorMessage()
        // console.log(verifiedEmail)
        // if (verifiedEmail && verifiedEmail !== 'null')
        // this.setState({
        //   email: verifiedEmail,
        // })
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
            actions.signIn(body, headers)
        }
    }

    onValidateForm() {
        const { email, password } = this.state
        const errors = []
        if (_.isEmpty(email)) {
            errors.push({ field: 'email' })
        } else if (!validator.isEmail(email, { allow_utf8_local_part: false })) {
            errors.push({ field: 'email' })
        }

        if (_.isEmpty(password)) {
            errors.push({ field: 'password' })
        }

        this.setState({
            errors: errors,
        })

        return errors
    }

    onHandleChange(event, fieldName) {
        const target = event.target
        const value = fieldName === 'isRememberMe' ? !this.state.isRememberMe : target.value
        this.setState({
            [fieldName]: value,
        })
    }

    onShowPassword() {
        this.setState({
            isShowPassword: true,
        })
    }

    onHidePassword() {
        this.setState({
            isShowPassword: false,
        })
    }

    render() {
        const { token, email, password, verifyToken, errors, isShowPassword } = this.state
        const { errorMessage, successMessage } = this.props
        return (
            token && token !== 'undefined'
                ? <Redirect to="/" />
                : (<div className='account-container'>
                    <div className='dialog'>
                        <Form className='form' onSubmit={(e) => this.onSubmitForm(e)}>
                            <div className='form-header'>
                                <Header as='h2' textAlign='center' >Sign in</Header>
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
                                            onMouseUp={this.onHidePassword.bind(this)}
                                            onMouseDown={this.onShowPassword.bind(this)}
                                            type='button'>
                                            SHOW
                                    </Button>
                                    }
                                    className={
                                        _.find(errors, { field: 'password' })
                                            ? 'normal-field error-field'
                                            : 'normal-field'}
                                    id='password'
                                    fluid={true}
                                    label={<label>Password</label>}
                                    onChange={(e) => this.onHandleChange(e, 'password')}
                                    type={isShowPassword ? 'text' : 'password'}
                                    value={password} />
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
                                <Grid columns='equal'>
                                    <Grid.Row>
                                        {/* <Grid.Column className='left-message'>
                                        <Checkbox
                                            checked={isRememberMe}
                                            className={
                                                isRememberMe
                                                    ? 'checkBox checked'
                                                    : 'checkBox'
                                            }
                                            label={{ children: 'Remember me' }}
                                            onChange={(e) => this.onHandleChange(e, 'isRememberMe')} />
                                    </Grid.Column> */}
                                        <Grid.Column textAlign='right'>
                                            <Link to='/retrievepassword' className='right-message'>Forgot password?</Link>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
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
                                <Button type='submit' className='submit-btn' onClick={(e) => this.onSubmitForm(e)} >LOGIN</Button>
                                <div className='center-message'>Not a user, <Link to='/signup'>sign up now.</Link></div>
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
        // verifiedEmail: state.account.verifiedEmail,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            signIn: accountActions.signIn,
            resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginContainer)

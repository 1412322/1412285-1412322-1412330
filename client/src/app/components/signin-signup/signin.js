import React from 'react'
import { Button, Form, Input, Header, Grid } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as walletManagementActions from '../../actions'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import './styles.scss'
import { Link } from 'react-router-dom'
import validator from 'validator'
class LoginContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            // isRememberMe: isRememberMe,
            isShowPassword: false,
            errors: [{
                field: '',
            }],
        }
    }

    onSubmitForm() {
        // const { actions } = this.props
        // const { fullname, email, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            console.log('Login successfully')
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
        const { email, password, errors, isShowPassword } = this.state
        return (
            <div className='container'>
                <div className='dialog'>
                    <Form className='form' onSubmit={() => this.onSubmitForm()}>
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
                            {/* <span
                                className='error-message}
                                style={
                                    (errorCode !== 1 && errorCode !== null)
                                        ? { display: 'block' }
                                        : { display: 'none' }
                                }>
                                {errorCode === '11' && 'Email address or password is incorrect'}
                                {errorCode === '14' && 'Invalid email address'}
                            </span> */}
                            <Button type='submit' className='submit-btn' onClick={() => this.onSubmitForm()} >LOGIN</Button>
                            <div className='center-message'>Not a user, <Link to='/signup'>sign up now.</Link></div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        error: state.authen.error,
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
)(LoginContainer)

// module.exports = LoginContainer

import React from 'react'
import { Button, Form, Header, Input, Popup } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as accountActions from '../../actions'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import './styles.scss'
import { Link } from 'react-router-dom'
import validator from 'validator'
import RequirementIcon from 'react-icons/lib/md/info-outline'
import RightIcon from 'react-icons/lib/md/check'

class RegisterForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fullname: '',
            email: '',
            password: '',
            confirmPassword: '',
            isShowPassword: false,
            errors: [{
                field: '',
                message: 0,
            }],
        }
    }

    componentWillMount() {
        const { actions } = this.props
        actions.resetErrorMessage()
    }

    onHandleChange(event, fieldName) {
        const target = event.target
        const value = target.value
        this.setState({
            [fieldName]: value,
        })
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
        if (_.isEmpty(this.onValidateForm())) {
            const { email, password } = this.state
            const { actions } = this.props
            console.log(actions)
            const headers = {
                'Content-Type': 'application/json'
            };
            const body = {
                "email": email,
                "password": password
            };
            actions.signUp(body, headers)
        }
    }

    onValidateForm() {
        const { email, password, confirmPassword } = this.state
        const errors = []
        // if (!noEmptyInput(fullname, 1, 255)) {
        //     errors.push({ field: 'fullname', message: 1 })
        // }

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

        this.setState({
            errors: errors,
        })

        return errors
    }

    render() {
        const { email, password, confirmPassword, errors, isShowPassword } = this.state
        const { errorMessage } = this.props
        return (
            <div className='container'>
                <div className='dialog'>
                    <Form className='form' onSubmit={(e) => this.onSubmitForm(e)}>
                        <div className='form-header'>
                            <Header as='h2' textAlign='center'>Create an account</Header>
                        </div>
                        <div className='form-body'>
                            {/* <Input
                                fluid={true}
                                type='text'
                                label={<label>Full name</label>}
                                className={
                                    _.find(errors, { field: 'fullname' })
                                        ? 'normal-field error-field'
                                        : 'normal-field'
                                }
                                value={fullname}
                                onChange={(e) => this.onHandleChange(e, 'fullname')} /> */}
                            <Input
                                fluid={true}
                                type='email'
                                label={
                                    <label>
                                        Email address
                                        <Popup
                                            className='tooltip'
                                            content={
                                                <p>
                                                    <RightIcon size={10} color='#7ed321' /> At least one letter
                                                    <br /><RightIcon size={10} color='#7ed321' /> Valid email address
                                                </p>
                                            }
                                            hideOnScroll={true}
                                            hoverable={true}
                                            offset={18}
                                            position='top center'
                                            trigger={
                                                <RequirementIcon size={15} color='#ff6868' />
                                            } />
                                    </label>
                                }
                                className={_.find(errors, { field: 'email' }) ? 'normal-field error-field' : 'normal-field'}
                                value={email}
                                onChange={(e) => this.onHandleChange(e, 'email')} />
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
                            <Button type='submit' className='submit-btn' onClick={(e) => this.onSubmitForm(e)} >REGISTER</Button>
                            <div className='center-message' >Already have an account, <Link to='/'>sign in now.</Link></div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log(state)
    return {
        errorMessage: state.account.errorMessage,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            signUp: accountActions.signUp,
            resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RegisterForm)
import React from 'react'
import { Button, Form, Input, Header, Grid } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as walletManagementActions from '../../actions'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import './styles.scss'
import { Link } from 'react-router-dom'
import validator from 'validator'
class RetrievePasswordContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
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
        const { email } = this.state
        const errors = []
        if (_.isEmpty(email)) {
            errors.push({ field: 'email' })
        } else if (!validator.isEmail(email, { allow_utf8_local_part: false })) {
            errors.push({ field: 'email' })
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
        const { email, errors } = this.state
        return (
            <div className='container'>
                <div className='dialog'>
                    <Form className='form' onSubmit={() => this.onSubmitForm()}>
                        <div className='form-header'>
                            <Header as='h2' textAlign='center' >Retrieve password</Header>
                        </div>
                        <div className='form-body'>
                            Please enter your registered email address. We will send you a link to reset your password.
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
                            <Button type='submit' className='submit-btn' onClick={() => this.onSubmitForm()} >SUBMIT</Button>
                            <div className='center-message'>Remember now? <Link to='/'>Try to sign in</Link> or <Link to='/signup'>create a new one.</Link></div>
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
)(RetrievePasswordContainer)

// module.exports = RetrievePasswordContainer

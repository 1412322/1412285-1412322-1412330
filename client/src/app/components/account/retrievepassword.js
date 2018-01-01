import React from 'react'
import { Button, Form, Input, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as accountActions from '../../actions'
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

    componentWillMount() {
        const { actions } = this.props
        actions.resetErrorMessage()
    }

    onSubmitForm(e) {
        e.preventDefault()
        // const { actions } = this.props
        // const { fullname, email, password, isRememberMe } = this.state
        if (_.isEmpty(this.onValidateForm())) {
            const { email } = this.state
            const { actions } = this.props
            const headers = {
                'Content-Type': 'application/json'
            };
            const body = {
                "email": email,
            };
            actions.retrievePassword(body, headers)
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
        const { errorMessage } = this.props
        return (
            <div className='account-container'>
                <div className='dialog'>
                    <Form className='form' onSubmit={(e) => this.onSubmitForm(e)}>
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
                            <span
                                className='error-message'
                                style={
                                    (errorMessage !== null)
                                        ? { display: 'block' }
                                        : { display: 'none' }
                                }>
                                {errorMessage}
                            </span>
                            <Button type='submit' className='submit-btn' onClick={(e) => this.onSubmitForm(e)} >SUBMIT</Button>
                            <div className='center-message'>Remember now? <Link to='/signin'>Try to sign in</Link> or <Link to='/signup'>create a new one.</Link></div>
                        </div>
                    </Form>
                </div>
            </div>
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
            retrievePassword: accountActions.retrievePassword,
            resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RetrievePasswordContainer)

// module.exports = RetrievePasswordContainer

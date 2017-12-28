import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as walletManagementActions from '../../actions'
import { bindActionCreators } from 'redux'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isEmail'
import isEmpty from 'validator/lib/isEmpty'
import { Link, Redirect } from 'react-router-dom'

class RegisterForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: null,
            token: null,
            // redirect: false,
            // error: null,
        }
    }

    signUp = () => {
        const { walletManagementActions } = this.props
        if (isEmpty($("#email").val()) || isEmpty($("#password").val()) || isEmpty($("#confirmpassword").val())) {
            walletManagementActions.getAuthenErrorMessage(9, false)
        }
        else if (!isEmail($("#email").val())) {
            walletManagementActions.getAuthenErrorMessage(10, false)
            // this.setState({
            //     error: 'Email is invalid',
            //     redirect: false
            // })
        }
        else if ($("#password").val() != $("#confirmpassword").val()) {
            walletManagementActions.getAuthenErrorMessage(11, false)
            // this.setState({
            //     error: 'Confirm Password is not match',
            //     redirect: false
            // })
        }
        else {
            var headers = {
                'Content-Type': 'application/json'
            }
            var body = {
                "email": $("#email").val(),
                "password": $("#password").val()
            }

            fetch('api/signup', {
                method: 'post',
                body: JSON.stringify(body),
                headers: headers,
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success === true) {
                        sessionStorage.setItem('token', data.token)
                        sessionStorage.setItem('email', data.email)
                        var wallet = {
                            "email": $("#email").val(),
                            "money": 1000
                        }
                        fetch('api/wallet/create', {
                            method: 'post',
                            body: JSON.stringify(wallet),
                            headers: headers,
                        })
                            .then(res2 => res2.json())
                        walletManagementActions.getAuthenErrorMessage(null, true)
                        // this.setState({
                        //     redirect: true
                        // })
                    }
                    else {
                        walletManagementActions.getAuthenErrorMessage(data.errorCode, false)
                        // this.setState({
                        //     error: data.msg,
                        //     redirect: false
                        // })
                    }
                })
        }
    }

    render() {
        const { error, isRedirect } = this.props
        return (
            sessionStorage.getItem('token')
                ? <Redirect to='/' />
                : (<Grid
                    textAlign='center'
                    style={{ height: '100%' }}
                    verticalAlign='middle'>
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as='h2' textAlign='center'>
                            Register an account
                    </Header>
                        <Form size='large'>
                            <Form.Input
                                fluid
                                icon='user'
                                iconPosition='left'
                                placeholder='Enter Email'
                                id="email"
                            />
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Enter Password'
                                type='password'
                                id="password"
                            />
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Confirm Password'
                                type='password'
                                id="confirmpassword"
                            />
                            {(error !== null && error !== 1 && error !== 2) &&
                                <Message negative>
                                    {error === 9 && 'Email and Password must not be empty.'}
                                    {error === 10 && 'Email is invalid.'}
                                    {error === 11 && 'Confirm password does not match.'}
                                    {error === 12 && 'Email is already exist.'}
                                </Message>}
                            <Button fluid size='large' onClick={this.signUp}>Register</Button>
                        </Form>
                        Already have account? <Link to='/signin'>Log-in</Link>
                    </Grid.Column>
                </Grid>)
        )
    }
}

const mapStateToProps = (state) => {
    return {
        error: state.authen.error,
        isRedirect: state.authen.isRedirect,
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
)(RegisterForm)

// module.exports = RegisterForm

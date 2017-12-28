import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as walletManagementActions from '../../actions'
import { bindActionCreators } from 'redux'
import { Link, Redirect } from 'react-router-dom'
class LoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: null,
            token: null,
            // redirect: false,
            // error: null,
        }
    }
    signIn = () => {
        const { walletManagementActions } = this.props
        // Set the headers
        const headers = {
            'Content-Type': 'application/json'
        }
        const body = {
            "email": $("#email").val(),
            "password": $("#password").val()
        };
        fetch('api/signin', {
            method: 'post',
            body: JSON.stringify(body),
            headers: headers,
        })
            .then(res => res.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('email', data.email);
                    walletManagementActions.getAuthenErrorMessage(null, true)
                    // this.setState({
                    //     redirect: true
                    // });
                }
                else {
                    walletManagementActions.getAuthenErrorMessage(data.errorCode, false)
                    // this.setState({
                    //     error: data.msg,
                    //     redirect: false
                    // });
                }
            })

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
                            Log-in to your account
                    </Header>
                        <Form size='large'>
                            <Form.Input
                                fluid
                                icon='user'
                                iconPosition='left'
                                placeholder='Enter Email'
                                id='email'
                            />
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Enter Password'
                                type='password'
                                id='password'
                            />
                            {(error === 1 || error === 2) &&
                                <Message negative>
                                    {error === 1 && 'User not found'}
                                    {error === 2 && 'Wrong password'}
                                </Message>}
                            <Button fluid size='large' onClick={this.signIn}>Login</Button>
                        </Form>
                        New to us? <Link to='/signup'>Register</Link>
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
)(LoginForm)

// module.exports = LoginForm

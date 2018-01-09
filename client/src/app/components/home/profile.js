import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header, Input, Button, Dimmer, Loader, Form } from 'semantic-ui-react'
import * as actions from '../../actions'
import { CopyToClipboard } from 'react-copy-to-clipboard'

class ProfileContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
        }
    }

    componentWillMount() {
        const { token } = this.state
        const { actions } = this.props
        const headers = {
            authorization: token,
            'Content-Type': 'application/json'
        }
        actions.getUserProfile(headers)
    }

    render() {
        const { userData } = this.props
        return (
            !userData
                ? (<Dimmer active={true} inverted={true}>
                    <Loader />
                </Dimmer>)
                : (<Container className='profile-container'>
                    <div className='profile-container-header'>
                        <Header as='h2' textAlign='center' >User's Profile</Header>
                    </div>
                    <div className='profile-container-body'>
                        <div className='container-header'>
                            {userData.msg}
                            {/* <div className='user-avatar'>{userData.email.charAt(0)}</div> */}
                        </div>
                        <div className='container-body'>
                            <Form>
                                <Form.Group widths='equal'>
                                    <Form.Field>
                                        <label>Email</label>
                                        <Input
                                            className='normal-field'
                                            fluid={true}
                                            readOnly={true}
                                            value={userData.email} />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Role</label>
                                        <Input
                                            className='normal-field'
                                            fluid={true}
                                            readOnly={true}
                                            value={userData.role === 'admin' ? 'Administrator' : 'Member'} />
                                    </Form.Field>
                                </Form.Group>
                            </Form>
                            <Form>
                                <Form.Group widths='equal'>
                                    <Form.Field>
                                        <label>Actual Balance</label>
                                        <Input
                                            className='normal-field'
                                            fluid={true}
                                            readOnly={true}
                                            value={userData.realMoney} />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Available Balance</label>
                                        <Input
                                            className='normal-field'
                                            fluid={true}
                                            readOnly={true}
                                            value={userData.availableMoney} />
                                    </Form.Field>
                                </Form.Group>
                            </Form>
                            <label>Address</label>
                            <Input
                                id='copy-input'
                                action={
                                    <CopyToClipboard text={userData.address}>
                                        <Button className='copy-btn'>Copy</Button>
                                    </CopyToClipboard>
                                }
                                className='normal-field'
                                fluid={true}
                                readOnly={true}
                                value={userData.address} />
                        </div>

                        {/* <div className='container-footer'>

                        </div> */}

                    </div>
                </Container>)
        )
    }
}

const mapStateToProps = (state) => ({
    userData: state.user.userData,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getUserProfile: actions.getUserProfile,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer)

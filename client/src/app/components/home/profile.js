import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header, Input } from 'semantic-ui-react'
import * as actions from '../../actions'

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
        const { userInfo } = this.props
        return (
            <Container className='appearanceSettingContainer'>
                <div className='appearanceSettingContainerHeader'>
                    <Header as='h2' textAlign='center' >User's Profile</Header>
                </div>
                <div className='appearanceSettingContainerBody'>
                    <div className='containerHeader'>
                        {userInfo.welcomeMessage}
                    </div>
                    <div className='containerBody'>
                        <Input
                            className='normal-field'
                            fluid={true}
                            label={<label>Email address</label>}
                            readOnly={true}
                            value={userInfo.email} />
                        <Input
                            className='normal-field'
                            fluid={true}
                            label={<label>Actual Balance</label>}
                            readOnly={true}
                            value={userInfo.realMoney} />
                        <Input
                            className='normal-field'
                            fluid={true}
                            label={<label>Available Balance</label>}
                            readOnly={true}
                            value={userInfo.availableMoney} />
                        <Input
                            className='normal-field'
                            fluid={true}
                            label={<label>Address</label>}
                            readOnly={true}
                            value={userInfo.address} />
                    </div>

                    <div className='containerFooter'>
                    </div>

                </div>
            </Container>
        )
    }
}

ProfileContainer.propTypes = {
}

const mapStateToProps = (state) => ({
    userInfo: state.user.userInfo,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getUserProfile: actions.getUserProfile,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer)

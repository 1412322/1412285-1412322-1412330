import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header, Menu, Tab, Image } from 'semantic-ui-react'
import * as actions from '../../actions'
import SendHistory from './send.history.js'
import ReceiveHistory from './receive.history.js'
// import validator from 'validator'
import * as _ from 'lodash'
// import RequirementIcon from 'react-icons/lib/md/info-outline'
import TabIcon01 from 'react-icons/lib/md/arrow-forward'

class HistoryContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            activeTabIndex: 0,
        }
    }

    componentWillMount() {
        sessionStorage.setItem('previous', this.props.location.pathname)
    }

    onHandleChangeTab = (e, data) => {
        // const { actions } = this.props
        // actions.switchChannel(data.activeIndex)
        this.setState({ activeTabIndex: data.activeIndex })
    }
    getMessengerChannel = (currentBot, channelName) => {
        if (currentBot) {
            return _.find(currentBot.get('channels').toJS(), (o) => o.channelType === channelName)
        }
        return null
    }

    render() {
        const { activeTabIndex } = this.state
        const panes = [
            {
                menuItem:
                    <Menu.Item key='websites' className={activeTabIndex === 0 ? 'normalChannel activeTab' : 'normalChannel'}>
                        <div className='channelName'>
                            Send List
                        </div>
                    </Menu.Item>,
                render: () => (<SendHistory />),
            },

            {
                menuItem:
                    <Menu.Item key='messenger' className={activeTabIndex === 1 ? 'normalChannel activeTab' : 'normalChannel'}>
                        <div className='channelName'>
                            {/* {activeTabIndex === 1 ? (
                                <div className='channelIcon}>
                                    <Image src={TabIcon01} />
                                    <Image src={TabIcon02} />
                                    <Image src={TabIcon2} />
                                </div>
                            ) :
                                <div className='channelIcon}>
                                    <Image src={TabIcon2} />
                                </div>
                            } */}
                            Receive List
                        </div>
                    </Menu.Item>,
                render: () => (<ReceiveHistory />),
            },
        ]
        return (
            <Container className='integrationSettingContainer'>
                <div className='integrationSettingContainerHeader'>
                    <Header as='h2' textAlign='center'>Transactions History</Header>
                </div>
                <div className='integrationSettingContainerBody'>
                    <Tab className='channel' menu={{ secondary: true }} renderActiveOnly={true} panes={panes} onTabChange={this.onHandleChangeTab} />
                </div>
            </Container>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.transaction.errorMessage,
        successMessage: state.transaction.successMessage,
        isFetching: state.transaction.isFetching,
        userData: state.user.userData,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            transferMoney: actions.transferMoney,
            // resetErrorMessage: accountActions.resetErrorMessage
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryContainer)

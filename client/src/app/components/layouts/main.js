import React from 'react'
import { Redirect } from 'react-router-dom'
import { Sidebar, Segment, Menu, Card, Dropdown, Dimmer, Loader } from 'semantic-ui-react'
import './styles.scss'
import MdMenu from 'react-icons/lib/md/menu'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import validator from 'validator'
// import * as ls from 'local-storage'

class MainLayout extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      token: sessionStorage.getItem('token'),
      isSideBarShowing: true,
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

  generateSibarItemClassName(url) {
    const path = this.props.children.props.location.pathname
    if (validator.equals(path, url)) {
      return 'sidebarItem active'
    } else {
      return 'sidebarItem'
    }
  }

  onClickBotItem(data) {
    // const { actions } = this.props
    // actions.changeCurrentBot(data)
  }

  toggleSideBar() {
    this.setState({
      isSideBarShowing: !this.state.isSideBarShowing,
    })
  }

  textSideBarContainer() {
    const { isSideBarShowing } = this.state
    return (
      <Sidebar
        as={Menu}
        animation='push'
        visible={isSideBarShowing}
        vertical={true}
        className={
          isSideBarShowing
            ? 'expanded-text-side-bar text-side-bar-menu'
            : 'text-side-bar-menu'}
      >
        <Card className='side-bar-item-block'>
          <Card.Content className='side-bar-item-content'>
            <Card.Header className='side-bar-item-header'>
              Home
            </Card.Header>
          </Card.Content>
          <Card.Content className='side-bar-item-content'>
            {/* <Link to='/'>
              <Menu.Item className={this.generateSibarItemClassName('/')}>
                Newsfeed
              </Menu.Item>
            </Link> */}
            <Link to='/'>
              <Menu.Item className={this.generateSibarItemClassName('/')}>
                Profile
              </Menu.Item>
            </Link>
          </Card.Content>
        </Card>
        <Card className='side-bar-item-block'>
          <Card.Content className='side-bar-item-content'>
            <Card.Header className='side-bar-item-header'>
              Transactions
          </Card.Header>
          </Card.Content>
          <Card.Content className='side-bar-item-content'>
            <Link to='/transactions/history'>
              <Menu.Item className={this.generateSibarItemClassName('/transaction/history')}>
                History
              </Menu.Item>
            </Link>

            <Link to='/transaction/transfer'>
              <Menu.Item className={this.generateSibarItemClassName('/transaction/transfer')}>
                Transfer
              </Menu.Item>
            </Link>
          </Card.Content>
        </Card>
        <Card className='side-bar-item-block'>
          <Card.Content className='side-bar-item-content'>
            <Card.Header className='side-bar-item-header'>
              Management
            </Card.Header>
          </Card.Content>
          <Card.Content className='side-bar-item-content'>
            <Link to='/admin/statistics'>
              <Menu.Item className={this.generateSibarItemClassName('/admin/statistics')}>
                Statistics
              </Menu.Item>
            </Link>
            <Link to='/admin/transactions'>
              <Menu.Item className={this.generateSibarItemClassName('/admin/transactions')}>
                Transactions
              </Menu.Item>
            </Link>
            <Link to='/admin/addresses'>
              <Menu.Item className={this.generateSibarItemClassName('/admin/addresses')}>
                Addresses
              </Menu.Item>
            </Link>
          </Card.Content>
        </Card>
      </Sidebar>
    )
  }

  render() {
    // const { component: Component, ...rest } = this.props
    const { token } = this.state
    const { userData } = this.props
    return (
      !token || token === 'undefined'
        ? <Redirect to="/signin" />
        : (!userData
          ? (<Dimmer active={true} inverted={true}>
            <Loader />
          </Dimmer>)
          : (<div className='main-layout' id='MainLayout'>
            <Menu className='navbar'>
              <Menu.Item className='navbar-item navbar-logo'>
                <Link to='/admin/dashboard'>
                  KCOIN
				      </Link>
              </Menu.Item>

              <Menu.Item className='navbar-item'>
                <MdMenu className='navbar-toggle' onClick={() => this.toggleSideBar()} />
              </Menu.Item>


              <Menu.Menu position='right'>
                <Menu.Item className='navbar-item'>
                  <Dropdown
                    trigger={(
                      <div className='account-avatar'>
                        {sessionStorage.getItem('email') && (
                          <span>{userData.email.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    icon={null}
                    pointing='top right'
                    className='dropdown'>
                    <Dropdown.Menu className='dropdown-menu'>
                      <Dropdown.Item className='dropdown-item'>
                        Actual Balance: {userData.realMoney}
                      </Dropdown.Item>
                      <Dropdown.Item className='dropdown-item'>
                        Available Balance: {userData.availableMoney}
                      </Dropdown.Item>
                      <Dropdown.Item className='dropdown-item' onClick={() => this.props.actions.signOut()}>
                        Sign-out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Item>
              </Menu.Menu>

            </Menu>

            <Sidebar.Pushable as={Segment} className='side-bar'>
              {this.textSideBarContainer()}
              <Sidebar.Pusher className='text-side-content'>
                {this.props.children}
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </div>))
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
      signOut: actions.signOut,
    }, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout)

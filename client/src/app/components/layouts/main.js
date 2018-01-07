import React from 'react'
import { Redirect } from 'react-router-dom'
import { Sidebar, Segment, Menu, Card, Dropdown } from 'semantic-ui-react'
import './styles.scss'
import MdMenu from 'react-icons/lib/md/menu'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as accountActions from '../../actions'
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
            <Link to='/admin/statistic'>
              <Menu.Item className={this.generateSibarItemClassName('/admin/statistic')}>
                Statistic
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
    return (
      !token || token === 'undefined'
        ? <Redirect to="/signin" />
        : (<div className='mainLayout' id='MainLayout'>
          <Menu className='navbar'>
            <Menu.Item className='navbarItem navbarLogo'>
              <Link to='/admin/dashboard'>
                LOGO
				      </Link>
            </Menu.Item>

            <Menu.Item className='navbarItem'>
              <MdMenu className='navbarToggle' onClick={() => this.toggleSideBar()} />
            </Menu.Item>


            <Menu.Menu position='right'>
              <Menu.Item className='navbarItem'>
                <Dropdown
                  trigger={(
                    <div className='accountAvatar'>
                      {sessionStorage.getItem('email') && (
                        <span>{sessionStorage.getItem('email').charAt(0)}</span>
                      )}
                    </div>
                  )}
                  icon={null}
                  pointing='top right'
                  className='dropdown'>
                  <Dropdown.Menu className='dropdownMenu'>
                    <Dropdown.Item className='dropdownItem' onClick={() => this.props.actions.signOut()}>
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
        </div>)
    )
  }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators({
      signOut: accountActions.signOut,
    }, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout)

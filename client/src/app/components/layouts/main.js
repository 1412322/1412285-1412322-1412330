// import { initAdminPage } from '../../../../commons/components/main_layout/main_layout.actions'
import React from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import { Sidebar, Segment, Menu, Card, Container, Header } from 'semantic-ui-react'
import './styles.scss'
import MdMenu from 'react-icons/lib/md/menu'
// import CreateIcon from 'react-icons/lib/md/add'
import { Link } from 'react-router-dom'
// import * as _ from 'lodash'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import validator from 'validator'
import { Route } from 'react-router-dom'
// import { actions as MainLayoutActions } from '@components/main_layout'
// import MdArrowDropDown from 'react-icons/lib/md/arrow-drop-down'
// import DashboardIcon from 'react-icons/lib/md/dashboard'
// import ConversationsIcon from 'react-icons/lib/md/chat-bubble'
// import AppearanceIcon from 'react-icons/lib/md/format-color-fill'
// import PersonalityIcon from 'react-icons/lib/md/perm-contact-calendar'
// import KnowledgeIcon from 'react-icons/lib/md/book'
// import IntegrationIcon from 'react-icons/lib/md/import-export'
// import DropDownIconDown from '@images/ic_arrow_down@1x.png'
// import { actions as authActions } from '@components/auth'
// import * as ls from 'local-storage'

class MainLayout extends React.Component {

  constructor(props) {
	super(props)
	this.state = {
		isSideBarShowing: true,
	}
  }

  componentWillMount() {
    // const { actions, isCompletedFetchingBots, bots } = this.props
    // const path = location.pathname
    // if (!isCompletedFetchingBots) {
    //   actions.initAdminPage()
    // }

    // if (isCompletedFetchingBots && (!bots || (bots && bots.size === 0))) {
    //   actions.redirectToCreateBot()
    // }

    // if (path && path.indexOf('/create_bot') < 0) {
    //   actions.showSideBar()
    //   actions.enableNavBarFuntions()
    // }
    // if (path && path.indexOf('/admin/conversations') === 0) {
    //   actions.showLogoSideBar()
    // }
  }

  generateSibarItemClassName(url) {
    const path = this.props.location.pathname
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
              <Menu.Item className={this.generateSibarItemClassName('/transactions/history')}>
                History
              </Menu.Item>
            </Link>

            <Link to='/transactions/exchange'>
              <Menu.Item className={this.generateSibarItemClassName('/transactions/exchange')}>
                Exchange
              </Menu.Item>
            </Link>

            {/* <Link to='/admin/setting_bot/knowledge'>
              <Menu.Item className={this.generateSibarItemClassName('/admin/setting_bot/knowledge')}>
                Knowledge
              </Menu.Item>
            </Link>

            <Link to='/admin/setting_bot/integration'>
              <Menu.Item className={this.generateSibarItemClassName('/admin/setting_bot/integration')}>
                Integration
              </Menu.Item>
            </Link> */}
          </Card.Content>
        </Card>
      </Sidebar>
    )
  }

  render() {
	  const { component: Component, ...rest } = this.props
	  console.log(this.props)
    return (
		<Route {...rest} render={props => {
			return sessionStorage.getItem('token') && sessionStorage.getItem('token') !== undefined
			  ?  (<div className='mainLayout' id='MainLayout'>
			  {/* <div className='processing'>
				<Dimmer active={true}>
				  <Loader size='massive'>Loading</Loader>
				</Dimmer>
			  </div> */}
	
			<Menu className='navbar'>
			  <Menu.Item className='navbarItem navbarLogo'>
				<Link to='/admin/dashboard'>
				  LOGO
				</Link>
			  </Menu.Item>
	
				<Menu.Item className='navbarItem'>
				  <MdMenu className='navbarToggle' onClick={() => this.toggleSideBar()} />
				</Menu.Item>
			  
	
			  {/* <Menu.Menu position='right'>
				<Menu.Item className='navbarItem}>
				  <Dropdown trigger={(
					<div className='accountAvatar}>
					  {username && (
						<span>{username.charAt(0)}</span>
					  )}
					</div>
				  )} options={options} inline={true} icon={(<MdArrowDropDown className='navbarItemDropBoxIcon} />)} className='navbarItemDropBox} />
				</Menu.Item>
			  </Menu.Menu> */}
	
			</Menu>
	
			<Sidebar.Pushable as={Segment} className='side-bar'>
			  {this.textSideBarContainer()}
			  <Sidebar.Pusher className='text-side-content'>
        {/* {this.props.children} */}
        <Container className='appearanceSettingContainer'>
        <div className='appearanceSettingContainerHeader'>
            <Header as='h2' textAlign='center' >User's Profile</Header>
        </div>
    </Container>
			  </Sidebar.Pusher>
			</Sidebar.Pushable>
		  </div>)
			  : <Redirect to="/signin" />
		  }} />
    )
  }
}

MainLayout.propTypes = {
//   children: PropTypes.element.isRequired,
//   isSideBarShowing: PropTypes.bool,
//   actions: PropTypes.object,
//   isCreatingBot: PropTypes.bool,
//   isShowingLoading: PropTypes.bool,
//   isSideBarLogoShowing: PropTypes.bool,
//   bots: PropTypes.array,
//   currentBot: PropTypes.object,
//   currentBotIndex: PropTypes.number,
//   isCompletedFetchingBots: PropTypes.bool,
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators({
    }, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout)

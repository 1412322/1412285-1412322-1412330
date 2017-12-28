import React from 'react'
// import Content from 'Content'
import { Link } from 'react-router-dom'
import { Sidebar, Segment, Button, Menu, Icon } from 'semantic-ui-react'

export default class Main extends React.Component {
	constructor() {
		super()
		this.state = {
			visible: false,
			email: sessionStorage.getItem('email'),
			token: sessionStorage.getItem('token')
		}
	}

	toggleVisibility() {
		this.setState({ visible: !this.state.visible })
	}

	signOut() {
		sessionStorage.removeItem('email')
		sessionStorage.removeItem('token')
		// location.href = '/signin'
	}

	render() {
		const { visible, email } = this.state
		return (
			<div>
				<Menu>
					<Menu.Item>
						<Button icon='sidebar' onClick={() => this.toggleVisibility()} />
					</Menu.Item>


					<Menu.Item>
						{this.state.token != null ?
							email
							:
							<Link to='/'>Log-in</Link>
						}
					</Menu.Item>
					{this.state.token != null ?
						null :
						<Menu.Item>
							<Link to='/signup'>Register</Link>
						</Menu.Item>
					}
				</Menu>
				<Sidebar.Pushable as={Segment}>
					<Sidebar as={Menu} animation='push' width='thin' visible={visible} icon='labeled' vertical inverted>
						<Link to='/home'>
							<Menu.Item>
								<Icon name='home' />
								Home
						</Menu.Item>
						</Link>
						<Link to='/transfers'>
							<Menu.Item>
								<Icon name='share' />
								Transfers
						</Menu.Item>
						</Link>
						<Link to='/transfershistory'>
							<Menu.Item>
								<Icon name='history' />
								Transfers History
						</Menu.Item>
						</Link>
						<Menu.Item onClick={this.signOut}>
							<Icon name='sign out' />
							Sign-out
						</Menu.Item>
					</Sidebar>
					<Sidebar.Pusher>
						<Segment basic>
							abc
						</Segment>
					</Sidebar.Pusher>
				</Sidebar.Pushable>
			</div>
		)
	}
}
import React from 'react'
import ReactDOM from 'react-dom'
import LoginForm from '../signin-signup/signin.js'
import RegisterForm from '../signin-signup/signup.js'
import Transfers from '../transfers/transfersmoney.js'
import TransfersHistory from '../transfers/transfershistory.js'
import Home from '../home'
import { Switch, Route } from 'react-router-dom'

class Content extends React.Component {
	render() {
		return (
			<Switch>
				{/* <Route exact path='/' component={SearchLocation} />
				<Route path='/studentlist' component={StudentList} />
				<Route path='/instagramlocationmedialist/:id' component={InstagramLocationMediaList} />
				<Route path='/addstudent' component={AddStudent} />
				<Route path='/studentinfo/:id' component={EditStudent} /> */}
				<Route exact path='/signin' component={LoginForm} />
				<Route path='/signup' component={RegisterForm} />
				<Route path='/transfers' component={Transfers} />
				<Route path='/transfershistory' component={TransfersHistory} />
				<Route path='/' component={Home} />
			</Switch>
		)
	}
}

module.exports = Content
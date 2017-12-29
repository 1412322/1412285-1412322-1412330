import React from 'react'
import LoginContainer from '../signin-signup/signin.js'
import RegisterContainer from '../signin-signup/signup.js'
import RetrievePasswordContainer from '../signin-signup/retrievepassword.js'
// import Transfers from '../transfers/transfersmoney.js'
// import TransfersHistory from '../transfers/transfershistory.js'
// import Home from '../home'
import { Switch, Route } from 'react-router-dom'

export default class Content extends React.Component {
	render() {
		return (
			<Switch>
				{/* <Route exact path='/' component={SearchLocation} />
				<Route path='/studentlist' component={StudentList} />
				<Route path='/instagramlocationmedialist/:id' component={InstagramLocationMediaList} />
				<Route path='/addstudent' component={AddStudent} />
				<Route path='/studentinfo/:id' component={EditStudent} /> */}
				<Route exact path='/' component={LoginContainer} />
				<Route path='/signup' component={RegisterContainer} />
				<Route path='/retrievepassword' component={RetrievePasswordContainer} />
				{/* <Route path='/transfers' component={Transfers} />
				<Route path='/transfershistory' component={TransfersHistory} /> */}
				{/* <Route path='/' component={Home} /> */}
			</Switch>
		)
	}
}

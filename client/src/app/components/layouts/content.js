import React from 'react'
import LoginContainer from '../account/signin.js'
import RegisterContainer from '../account/signup.js'
import RetrievePasswordContainer from '../account/retrievepassword.js'
import ResetPasswordContainer from '../account/resetpassword.js'
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
				<Route path='/resetpassword' component={ResetPasswordContainer} />
				{/* <Route path='/transfers' component={Transfers} />
				<Route path='/transfershistory' component={TransfersHistory} /> */}
				{/* <Route path='/' component={Home} /> */}
			</Switch>
		)
	}
}

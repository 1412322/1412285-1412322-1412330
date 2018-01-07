import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container } from 'semantic-ui-react'

class ProfileContainer extends React.Component {

    render() {
        return (
            <Container className='error-page-container'>
                <span className='error-message'>Warning: You do not have permission to access this feature.</span>
            </Container>
        )
    }
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer)

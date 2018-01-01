import React from 'react'
import styles from './styles.scss'
import Proptypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Header } from 'semantic-ui-react'

class NewsfeedContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }


    render() {
        return (
            <Container className='appearanceSettingContainer'>
                <div className='appearanceSettingContainerHeader'>
                    <Header as='h2' textAlign='center' >Welcome to KCoin</Header>
                </div>
            </Container>
        )
    }
}

NewsfeedContainer.propTypes = {
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsfeedContainer)

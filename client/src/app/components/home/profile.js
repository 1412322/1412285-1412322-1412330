import React from 'react'
// import { MainLayout } from '../../commons/Layout'
import ReactDOM from 'react-dom'
import styles from './styles.scss'
import Proptypes from 'prop-types'
// import { actions as MainLayoutActions } from '@components/main_layout'
// import * as AppearanceActions from './appearance.actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, Grid, Container, Image, Header, Input, Label, Popup } from 'semantic-ui-react'
import MainLayout from '../layouts/main.js'
// import EditIcon from '@images/ic_edit@1x.png'
// import BotAvatar from '@images/laura_default_avatar.png'
// import AppearanceAvatar from '@images/ic_appearance_avatar@1x.png'
// import SettingContainer from '../commons'
// import { SketchPicker } from 'react-color'
// import AvatarEditor from '../commons/avatar_editor'
// import ImageDataConverter from '@commons/utils/imageDataConverter'

class ProfileContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }


    render() {
        const { isTitleEditable, isNameEditable } = this.state
        return (
            <MainLayout>
                <Container className='appearanceSettingContainer'>
                    <div className='appearanceSettingContainerHeader'>
                        <Header as='h2' textAlign='center' >User's Profile</Header>
                    </div>
                    <div className='appearanceSettingContainerBody'>
                        <div className='containerHeader'>
                        </div>
                        <div className='containerBody'>
                        </div>

                        <div className='containerFooter'>
                        </div>

                    </div>
                </Container>
            </MainLayout>
        )
    }
}

ProfileContainer.propTypes = {
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

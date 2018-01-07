import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Table, Container, Header } from 'semantic-ui-react'

class StatisticContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
        }
    }

    componentWillMount() {
        const { token } = this.state
        const { actions } = this.props
        const headers = {
            authorization: token,
            'Content-Type': 'application/json'
        }
        actions.checkUserRole(headers)
    }


    render() {
        const { role } = this.props
        return (
            !role 
            ? <span>You do not have permission to access this feature</span>
            : (<Container className='statistic-container'>
                <div className='statistic-container-header'>
                    <Header as='h2' textAlign='center' >Statistic</Header>
                </div>
                <div className='statistic-container-body'>
                    <Table className='statistic-table' fixed={true}>
                        <Table.Header className='table-header'>
                            <Table.Row verticalAlign='middle'>
                                <Table.HeaderCell>User</Table.HeaderCell>
                                <Table.HeaderCell>Address</Table.HeaderCell>
                                <Table.HeaderCell>Actual Balance</Table.HeaderCell>
                                <Table.HeaderCell>Available Balance</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row verticalAlign='top'>
                                <Table.Cell>
                                    <span className='order'>1</span>asdsad
                            </Table.Cell>
                                <Table.Cell>
                                    sdasdasd
                            </Table.Cell>
                                <Table.Cell>
                                    sdasdasd
                            </Table.Cell>
                                <Table.Cell>
                                    sdasdasd
                            </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                        <Table.Footer fullWidth={true}>
                        </Table.Footer>
                    </Table>
                </div>
            </Container>)
        )
    }
}

const mapStateToProps = (state) => ({
    statisticData: state.user.statisticData,
    role: state.user.role,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            checkUserRole: actions.checkUserRole,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatisticContainer)


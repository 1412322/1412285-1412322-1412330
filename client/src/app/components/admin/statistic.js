import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Table, Container, Header, Dimmer, Loader } from 'semantic-ui-react'

class StatisticContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            data: undefined,
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

    componentWillReceiveProps(nextProps) {
        if (this.props.statisticData !== nextProps.statisticData) {
            this.setState({
                data: nextProps.statisticData,
            })
        }
    }

    render() {
        const { data } = this.state
        return (
            !data
                ? (<Dimmer active={true} inverted={true}>
                    <Loader />
                </Dimmer>)
                : !data.success
                    ? <span>data.msg</span>
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
                                    {data.listTotalResult.map((data, index) =>
                                        <Table.Row key={index} verticalAlign='top'>
                                            <Table.Cell>
                                                <span className='order'>{index + 1}</span>{data.email}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {data.address}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {data.realMoney}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {data.availableMoney}
                                            </Table.Cell>
                                        </Table.Row>
                                    )}

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
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            checkUserRole: actions.checkUserRole,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatisticContainer)


import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Redirect } from 'react-router-dom'
import { Table, Container, Header, Dimmer, Loader, Statistic } from 'semantic-ui-react'
import ReactPaginate from 'react-paginate'

class StatisticContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            data: undefined,
            offset: 0,
            limit: 5,
        }
    }

    componentWillMount() {
        console.log(this.state.offset)
        this.loadDataFromServer(this.state.offset)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.statisticData !== nextProps.statisticData) {
            this.setState({
                data: nextProps.statisticData,
            })
        }
    }

    // componentDidMount() {
    //     this.loadDataFromServer()
    // }

    handlePageClick = (data) => {
        const selected = data.selected;
        console.log(selected)
        const offset = Math.ceil(selected * 5);

        this.setState({ offset: offset }, () => {
            this.loadDataFromServer()
        })
    }

    loadDataFromServer() {
        const { token } = this.state
        const { actions } = this.props
        const headers = {
            authorization: token,
            'Content-Type': 'application/json'
        }
        const body = {
            "offset": this.state.offset,
            "limit": this.state.limit,
        };
        actions.getAdminStatisticData(headers, body, this.state.offset, this.state.limit)
    }

    render() {
        const { data, offset } = this.state
        const { isFetching } = this.props
        return (
            !data
                ? (<Dimmer active={true} inverted={true}>
                    <Loader />
                </Dimmer>)
                : !data.success
                    ? <Redirect to="/admin/403" />
                    : (<Container className='statistic-container'>
                        <div className='statistic-container-header'>
                            <Header as='h2' textAlign='center' >Statistic</Header>
                        </div>
                        <div className='statistic-container-body'>
                            <Statistic.Group>
                                <Statistic>
                                    <Statistic.Value style={{ color: '#7ed321' }}>{data.totalUser ? data.totalUser : 0}</Statistic.Value>
                                    <Statistic.Label>Total Users</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value style={{ color: '#7ed321' }}>{data.totalrealMoney ? data.totalrealMoney : 0}</Statistic.Value>
                                    <Statistic.Label>Actual Balances</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value style={{ color: '#7ed321' }}>{data.totalavailableMoney ? data.totalavailableMoney : 0}</Statistic.Value>
                                    <Statistic.Label>Available Balances</Statistic.Label>
                                </Statistic>
                            </Statistic.Group>
                            <Table className='statistic-table'>
                                <Table.Header className='table-header'>
                                    <Table.Row verticalAlign='middle'>
                                        <Table.HeaderCell>User</Table.HeaderCell>
                                        <Table.HeaderCell>Address</Table.HeaderCell>
                                        <Table.HeaderCell width={2}>Actual Balance</Table.HeaderCell>
                                        <Table.HeaderCell width={2}>Available Balance</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isFetching
                                        ? (<Table.Row>
                                            <Loader active={true} inline='centered' />
                                        </Table.Row>)
                                        : (data.listTotalResult.map((data, index) =>
                                            <Table.Row key={index} verticalAlign='top'>
                                                <Table.Cell>
                                                    <span className='order'>{index + offset + 1}</span>{data.email}
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
                                        ))
                                    }
                                </Table.Body>
                                <Table.Footer fullWidth={true}>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan='4'>
                                            <ReactPaginate previousLabel={"Previous"}
                                                nextLabel={"Next"}
                                                breakLabel={<a href="">...</a>}
                                                breakClassName={"break-me"}
                                                pageCount={this.props.pageCount}
                                                marginPagesDisplayed={2}
                                                pageRangeDisplayed={5}
                                                onPageChange={this.handlePageClick}
                                                containerClassName={"pagination"}
                                                subContainerClassName={"pages pagination"}
                                                activeClassName={"active"} />
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Footer>
                            </Table>
                        </div>
                    </Container >)
        )
    }
}

const mapStateToProps = (state) => ({
    statisticData: state.user.statisticData,
    pageCount: state.user.pageCount,
    isFetching: state.user.isFetching,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getAdminStatisticData: actions.getAdminStatisticData,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatisticContainer)


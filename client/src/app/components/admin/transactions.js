import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Redirect } from 'react-router-dom'
import { Table, Container, Header, Dimmer, Loader, Statistic } from 'semantic-ui-react'
import ReactPaginate from 'react-paginate'
import Moment from 'react-moment'

class TransactionDataContainer extends React.Component {

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
        this.loadDataFromServer()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.transactionData !== nextProps.transactionData) {
            this.setState({
                data: nextProps.transactionData,
            })
        }
    }

    // componentDidMount() {
    //     this.loadDataFromServer()
    // }

    handlePageClick = (data) => {
        const { limit } = this.state
        const selected = data.selected;
        console.log(selected)
        const offset = Math.ceil(selected * limit);

        this.setState({ offset: offset }, () => {
            this.loadDataFromServer()
        })
    }

    loadDataFromServer() {
        const { token, offset, limit } = this.state
        const { actions } = this.props
        const headers = {
            authorization: token,
            'Content-Type': 'application/json'
        }
        const body = {
            "offset": offset,
            "limit": limit,
        };
        actions.getAdminTransactionData(headers, body, offset, limit)
    }

    render() {
        const { data, offset } = this.state
        const { isFetching, userData } = this.props
        return (
            userData.role !== 'admin'
                ? <Redirect to="/admin/403" />
                : !data
                    ? (<Dimmer active={true} inverted={true}>
                        <Loader />
                    </Dimmer>)
                    : (<Container className='admin-container'>
                        <div className='admin-container-header'>
                            <Header as='h2' textAlign='center' >Transactions Management</Header>
                        </div>
                        <div className='admin-container-body'>
                            <Statistic horizontal={true}>
                                <Statistic.Value>{data.total}</Statistic.Value>
                                <Statistic.Label>Hashes</Statistic.Label>
                            </Statistic>
                            <Table className='statistic-table' fixed={true}>
                                <Table.Header className='table-header'>
                                    <Table.Row verticalAlign='middle'>
                                        <Table.HeaderCell>Hash</Table.HeaderCell>
                                        <Table.HeaderCell>Time</Table.HeaderCell>
                                        <Table.HeaderCell>Status</Table.HeaderCell>
                                        <Table.HeaderCell>Inputs</Table.HeaderCell>
                                        <Table.HeaderCell>Outputs</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isFetching
                                        ? (<Table.Row>
                                            <Table.HeaderCell colSpan='5'>
                                                <Loader active={true} inline='centered' />
                                            </Table.HeaderCell>
                                        </Table.Row>)
                                        : (data.listResult.map((data, index) =>
                                            <Table.Row key={index} verticalAlign='top'>
                                                <Table.Cell>
                                                    <span className='order'>{index + offset + 1}</span><div className='address-block'>{data.hash}</div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Moment unix={true}>{data.time}</Moment>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.state}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.inputs.map((input, index) =>
                                                        <div className='address-block' key={index}>#{input.referencedOutputIndex}: <a>{input.referencedOutputHash}</a></div>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.outputs.map((output, index) =>
                                                        <div className='address-block' key={index}>#{output.index}: <span>{output.value}</span> to <a>{output.address}</a></div>
                                                    )}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                    }
                                </Table.Body>
                                <Table.Footer fullWidth={true}>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan='5'>
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
    transactionData: state.user.transactionData,
    pageCount: state.user.pageCount,
    isFetching: state.user.isFetching,
    userData: state.user.userData,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getAdminTransactionData: actions.getAdminTransactionData,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDataContainer)


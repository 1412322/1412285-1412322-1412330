import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Redirect } from 'react-router-dom'
import { Table, Container, Header, Dimmer, Loader, Statistic } from 'semantic-ui-react'
import ReactPaginate from 'react-paginate'

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
        actions.getAdminTransactionData(headers, body, this.state.offset, this.state.limit)
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
                            <Header as='h2' textAlign='center' >Transactions</Header>
                        </div>
                        <div className='statistic-container-body'>
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
                                            <Loader active={true} inline='centered' />
                                        </Table.Row>)
                                        : (data.listResult.map((data, index) =>
                                            <Table.Row key={index} verticalAlign='top'>
                                                <Table.Cell>
                                                    <span className='order'>{index + offset + 1}</span>{data.hash}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.time}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.state}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.inputs.map((input, index) =>
                                                        <div className='address-block' key={index}>#{index}: <a>{input.referencedOutputHash}</a></div>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.outputs.map((output, index) =>
                                                        <div className='address-block' key={index}>#{index}: {output.value} to <a>{output.address}</a></div>
                                                    )}
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
    transactionData: state.user.transactionData,
    pageCount: state.user.pageCount,
    isFetching: state.user.isFetching,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getAdminTransactionData: actions.getAdminTransactionData,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDataContainer)


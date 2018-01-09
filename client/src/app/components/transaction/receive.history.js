import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, Tab, Loader } from 'semantic-ui-react'
import * as actions from '../../actions'
// import validator from 'validator'
import * as _ from 'lodash'
import Moment from 'react-moment'

class ReceiveHistoryContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            data: undefined,
        }
    }

    componentWillMount() {
        const { actions, userData } = this.props
        const headers = {
            authorization: userData.token,
            'Content-Type': 'application/json'
        }
        actions.getTransactionHistoryData(headers)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.historyData !== nextProps.historyData) {
            this.setState({
                data: nextProps.historyData,
            })
        }
    }

    render() {
        const { data } = this.state
        const { isFetching } = this.props
        return (
            <Tab.Pane attached={false} className='channelContent'>
                <Table className='statistic-table'>
                    <Table.Header className='table-header'>
                        <Table.Row verticalAlign='middle'>
                            <Table.HeaderCell>Hash</Table.HeaderCell>
                            <Table.HeaderCell>Time</Table.HeaderCell>
                            <Table.HeaderCell>Sender Address</Table.HeaderCell>
                            <Table.HeaderCell>Output Index</Table.HeaderCell>
                            <Table.HeaderCell>Value</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {isFetching || !data
                            ? (<Table.Row>
                                <Table.HeaderCell colSpan='4'>
                                    <Loader active={true} inline='centered' />
                                </Table.HeaderCell>
                            </Table.Row>)
                            : (data.listTranReceive.map((data, index) =>
                                <Table.Row key={index} verticalAlign='top'>
                                    <Table.Cell>
                                        <span className='order'>{index + 1}</span><div className='address-block'>{data.hash}</div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Moment unix={true}>{data.time}</Moment>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className='address-block'><a>{data.sender}</a></div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {data.index}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {data.money}
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        }
                    </Table.Body>
                    {/* <Table.Footer fullWidth={true}>
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
                    </Table.Footer> */}
                </Table>
            </Tab.Pane>
        )
    }
}

const mapStateToProps = (state) => ({
    historyData: state.transaction.historyData,
    isFetching: state.transaction.isFetching,
    userData: state.user.userData,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getTransactionHistoryData: actions.getTransactionHistoryData,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveHistoryContainer)

import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Redirect } from 'react-router-dom'
import { Table, Container, Header, Dimmer, Loader, Statistic } from 'semantic-ui-react'
import ReactPaginate from 'react-paginate'

class AddressDataContainer extends React.Component {

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
        if (this.props.addressData !== nextProps.addressData) {
            this.setState({
                data: nextProps.addressData,
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
        }
        actions.getAdminAddressData(headers, body, offset, limit)
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
                            <Header as='h2' textAlign='center' >Addresses Management</Header>
                        </div>
                        <div className='admin-container-body'>
                            <Statistic horizontal={true}>
                                <Statistic.Value>{data.total}</Statistic.Value>
                                <Statistic.Label>Addresses</Statistic.Label>
                            </Statistic>
                            <Table className='statistic-table' fixed={true}>
                                <Table.Header className='table-header'>
                                    <Table.Row verticalAlign='middle'>
                                        <Table.HeaderCell>Address</Table.HeaderCell>
                                        <Table.HeaderCell>Reference User</Table.HeaderCell>
                                        <Table.HeaderCell width={3}>Actual Balance</Table.HeaderCell>
                                        <Table.HeaderCell width={3}>Available Balance</Table.HeaderCell>

                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isFetching
                                        ? (<Table.Row>
                                            <Table.HeaderCell colSpan='4'>
                                                <Loader active={true} inline='centered' />
                                            </Table.HeaderCell>
                                        </Table.Row>)
                                        : (data.listTotalResult.map((data, index) =>
                                            <Table.Row key={index} verticalAlign='top'>
                                                <Table.Cell>
                                                    <span className='order'>{index + offset + 1}</span><div className='address-block'>{data.address}</div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.referenceUser}
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
    addressData: state.user.addressData,
    pageCount: state.user.pageCount,
    isFetching: state.user.isFetching,
    userData: state.user.userData,
})

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            getAdminAddressData: actions.getAdminAddressData,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressDataContainer)


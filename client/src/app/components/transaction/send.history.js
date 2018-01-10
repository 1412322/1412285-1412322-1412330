import React from 'react'
import './styles.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, Tab, Loader, Button } from 'semantic-ui-react'
import * as actions from '../../actions'
// import validator from 'validator'
import Moment from 'react-moment'

class SendHistoryContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: sessionStorage.getItem('token'),
            data: undefined,
            open: false,
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

    show = () => this.setState({ open: true })
    close = () => this.setState({ open: false })

    // onValidateForm() {
    //     const { googleKey } = this.state
    //     const errors = []

    //     if (_.isEmpty(googleKey)) {
    //         errors.push({ field: 'googleKey' })
    //     }

    //     this.setState({
    //         errors: errors,
    //     })

    //     return errors
    // }

    // onHandleChange(event, fieldName) {
    //     const target = event.target
    //     const value = target.value
    //     this.setState({
    //         [fieldName]: value,
    //     })
    // }

    onDeleteTransaction(key) {
        const { actions, userData } = this.props
        const headers = {
            authorization: userData.token,
            'Content-Type': 'application/json'
        }
        actions.deleteInitializedTransaction(headers, key)
    }

    render() {
        const { data } = this.state
        const { isFetching } = this.props
        return (
            <React.Fragment>
                <Tab.Pane attached={false} className='channelContent'>
                    <Table className='statistic-table'>
                        <Table.Header className='table-header'>
                            <Table.Row verticalAlign='middle'>
                                <Table.HeaderCell>Hash</Table.HeaderCell>
                                <Table.HeaderCell>Time</Table.HeaderCell>
                                <Table.HeaderCell>State</Table.HeaderCell>
                                <Table.HeaderCell>Outputs</Table.HeaderCell>
                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {isFetching || !data
                                ? (<Table.Row>
                                    <Table.HeaderCell colSpan='5'>
                                        <Loader active={true} inline='centered' />
                                    </Table.HeaderCell>
                                </Table.Row>)
                                : (data.listTranSend.map((data, index) =>
                                    <Table.Row key={index} verticalAlign='top'>
                                        <Table.Cell>
                                            <span className='order'>{index + 1}</span><div className='address-block'>{data.hash}</div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Moment unix={true}>{data.time}</Moment>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {data.state}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {data.outputs.map((output, index) =>
                                                <div className='address-block' key={index}>#{output.index}: <span>{output.money}</span> to <a>{output.address}</a></div>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button disabled={!(data.state === 'initialized')} className='delete-btn' onClick={() => this.onDeleteTransaction(data.auth)}>Delete</Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            }
                        </Table.Body>
                    </Table>
                </Tab.Pane>
            </React.Fragment>
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
            deleteInitializedTransaction: actions.deleteInitializedTransaction,
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendHistoryContainer)

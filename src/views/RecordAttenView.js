import React from 'react';
import Divider from '../components/Divider';
import { Button, ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push, goBack } from 'react-router-redux';
import AttendenceHistory from '../components/AttendenceHistory';
import { prepareAttendanceHistoryData } from '../modules/main'

import {
    PagingState,
    LocalPaging,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    TableView,
    TableHeaderRow,
    PagingPanel,
} from '@devexpress/dx-react-grid-bootstrap3';

class RecordAttenView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    componentWillMount() {
        let { params, prepareAttendanceHistoryData } = this.props;
        prepareAttendanceHistoryData(params.productId);
    }
    componentWillUnmount() {
    }
    render() {
        // allowedPageSizes | <PagingPanel allowedPageSizes={allowedPageSizes} />
        const { rows, columns } = this.props.attenHistoryTblData;
        if( typeof rows !== 'undefined' && typeof columns !== 'undefined' )
        return (
            <div>
                <Button bsStyle="primary" onClick={this.props.goBack} >{'Back'}</Button>
                <Divider />
                <Grid rows={rows} columns={columns} >
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <LocalPaging />
                    <TableView />
                    <TableHeaderRow />
                </Grid>
            </div>
        );
        return (
            <div>
                <code>{'Loading...'}</code>
            </div>
        );
    }
}

const select = (store, ownProps) => ({
    params: ownProps.match.params,
    enrolments: store.main.enrolments,
    attenHistoryTblData: store.main.attenHistoryTblData
});
const actions = dispatch => bindActionCreators({
    navAttendence: () => push('/secured/attendance'),
    goBack: () => goBack(),
    prepareAttendanceHistoryData: (productId) => prepareAttendanceHistoryData({productId})
}, dispatch)
export default connect(select, actions)(RecordAttenView);

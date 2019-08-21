import React from 'react';
import { connect } from 'react-redux';
import { fetchStudentDetail } from '../modules/main';
import { bindActionCreators } from 'redux';
import { BeatLoader } from 'react-spinners';
import { Pager, ControlLabel, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown, Grid as BGrid} from 'react-bootstrap';
import {
    PagingState,
    LocalPaging,
    RowDetailState,
    LocalFiltering,
    LocalSorting,
    LocalGrouping,
    FilteringState
} from '@devexpress/dx-react-grid';
import Divider from '../components/Divider';
import {
    Grid,
    TableView,
    TableHeaderRow,
    PagingPanel,
    TableRowDetail
} from '@devexpress/dx-react-grid-bootstrap3';

class ProductDetailView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { loading } = this.state;
        return (
            <div>
                <Divider />
                <center>{'No Data Found'}</center>
                <Divider />
            </div>
        );
    }
}

const select = (store) => ({
});

const actions = dispatch => bindActionCreators({
}, dispatch)

export default connect(select, actions)(ProductDetailView);

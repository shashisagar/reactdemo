import React from 'react';
import { connect } from 'react-redux';
import { prepareStudentsTableData, filterTable } from '../modules/main';
import { showStudentDetail, loadData, productChanged, filterByStudent, filterByParent, updateCurrentPage } from '../modules/student'
import { bindActionCreators } from 'redux';
import { BeatLoader } from 'react-spinners';
import Divider from '../components/Divider';
import {splitProductSku, joinProductSku} from '../utils';
import '../styles/StudentsView.css';
import { Glyphicon, Table, Panel, Pager, ControlLabel, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown, Grid as BGrid} from 'react-bootstrap';
import {
    PagingState,
    LocalPaging,
    RowDetailState,
    LocalFiltering,
    LocalSorting,
    LocalGrouping,
    FilteringState,
    EditingState,
    TableEditColumn,
    TableEditRow,
    SortingState,
    TableColumnResizing,
    SelectionState
} from '@devexpress/dx-react-grid';

import {
    Grid,
    TableView,
    TableHeaderRow,
    PagingPanel,
    TableRowDetail,
    TableSelection
} from '@devexpress/dx-react-grid-bootstrap3';
import StudentDetailView from './StudentDetailView';
import {HighlightedCellStudentsTable} from './HighlightedCell';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { push, goBack } from 'react-router-redux';

class StudentsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        this.onProductChanged = this.onProductChanged.bind(this);
        this.handleFilterStudent = this.handleFilterStudent.bind(this);
        this.handleFilterParent = this.handleFilterParent.bind(this);
        this.tableCellTemplate = this.tableCellTemplate.bind(this);
        this.changeSelection = this.changeSelection.bind(this);
    }

    changeSelection(selection) {
        this.props.showStudentDetail(selection)
    }

    validationInputField(value) {
        if(value === '') return true;
        var regex = new RegExp("^[ A-Za-z0-9_@./#&+-]+$");
        if (regex.test(value)) {
            return true;
        }
        return false;
    }

    componentWillReceiveProps(nextProps) {
        // if(nextProps.products !== this.props.products) {
        // }
    }

    componentDidMount() {
        if(Object.keys(this.props.studentsTblData).length === 0)
            this.props.loadData()
    }

    onProductChanged(event) {
        this.props.productChanged(event ? event.value : '')
    }

    handleFilterStudent(event) {
        let { value:studentName } = event.target;
        if(!this.validationInputField(studentName)) return
        this.props.filterByStudent(studentName)
    }

    handleFilterParent(event) {
        let { value:parentName } = event.target;
        if(!this.validationInputField(parentName)) return
        this.props.filterByParent(parentName)
    }

    tableCellTemplate({ row, column, style }){
        const {studentName, parentName} = this.props;
        return (
            <HighlightedCellStudentsTable align={column.align} row={row} style={style} studentName={studentName} parentName={parentName} column={column.name}/>
        );
    }

    prepareProductList() {
        let { products } = this.props;
        return Object.values(products).map(({productPK, name}) => ({ value: joinProductSku(productPK), label: `${name} ${productPK.sku ? '(SKU: '+productPK.sku+')' : ''}`}));
    }

    renderFormContent() {
        const { studentName, parentName, productIdSku } = this.props
        return (
            <div>
                <Row className="show-grid align-left">
                    <Col xs={12} md={3}>
                        <FormGroup controlId="formControlsSelect">
                            <FormControl type="text" value={studentName} placeholder="Search by student name" onChange={this.handleFilterStudent} />
                        </FormGroup>
                    </Col>
                    <Col xs={12} md={3}>
                        <FormGroup controlId="formControlsSelect">
                            <FormControl type="text" value={parentName} placeholder="Search by parent name" onChange={this.handleFilterParent} />
                        </FormGroup>
                    </Col>
                    <Col xs={12} md={6}>
                        <FormGroup controlId="formControlsSelect">
                            <Select
                                disabled={false}
                                placeholder={'Search by product name or sku'}
                                name="form-field-name"
                                value={productIdSku}
                                onChange={this.onProductChanged}
                                options={this.prepareProductList()} />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        )
    }

    updateCurrentPage(currentPage) {
        this.props.updateCurrentPage(currentPage)
    }

    renderStudentsTable() {
        const {studentsTblData: {rows, columns}, selection, currentPage} = this.props
        return (
            <Grid rows={rows} columns={columns} >
                <SelectionState selection={selection} onSelectionChange={this.changeSelection} />
                <SortingState />
                <LocalSorting />
                <PagingState defaultCurrentPage={currentPage} defaultPageSize={10} onCurrentPageChange={currentPage => {
                    this.updateCurrentPage(currentPage)
                }}/>
                <LocalPaging />
                <TableView tableCellTemplate={this.tableCellTemplate} />
                <TableColumnResizing defaultColumnWidths={{name: 230, age: 50, gender: 80, parentName: 230, parentEmail: 230, parentPhone: 150, reactions: 80, liability: 80, photographyConsent: 100, medicalConsent: 100}} />
                <TableHeaderRow allowSorting />
                <PagingPanel />
                <TableSelection selectByRowClick showSelectionColumn={false} />
            </Grid>
        )
    }

    renderDownloadContent() {
        const { productIdSku, products } = this.props
        let productPK = splitProductSku(productIdSku)
        var product = products.find(product => (product.productPK.id === parseInt(productPK.id, 10) && product.productPK.sku === productPK.sku));
        if(!product) return null;
        return (
            <div>
                <div className="pull-left">
                    <p>Showing Enrollments for Product <strong>{product.name}</strong> <small>{`${product.productPK.sku ? `(SKU: ${product.productPK.sku})` : ''}`}</small></p>
                </div>
                <div className="pull-right">

                </div>
                <div className="clearfix" />
                <Divider />
            </div>
        )
    }

    render() {
        const { studentsTblData: {rows, columns}, loading } = this.props
        return (
            <div>
                {loading && this.renderLoadingContent(true)}
                {!loading && this.renderFormContent()}
                {!loading && this.renderDownloadContent()}
                {Object.keys(this.props.studentsTblData).length !== 0 && this.renderStudentsTable()}
            </div>
        )
    }

    renderLoadingContent(condn) {
        return (
            <div>
                <Divider />
                <center><BeatLoader color={'#000'} loading={condn} /></center>
                <Divider />
            </div>
        )
    }
}



const select = store => ({
    studentsTblData: store.main.studentsTblData,
    products: store.service.products,
    loading: store.student.loading,
    productIdSku: store.student.productIdSku,
    currentPage: store.student.currentPage,
    studentName: store.student.studentName,
    parentName: store.student.parentName
});

const actions = dispatch => bindActionCreators({
    showStudentDetail: (selection) => showStudentDetail({selection}),
    loadData: () => loadData(),
    productChanged: (productIdSku) => productChanged({productIdSku}),
    filterByStudent: (studentName) => filterByStudent({studentName}),
    filterByParent: (parentName) => filterByParent({parentName}),
    updateCurrentPage: (currentPage) => updateCurrentPage({currentPage}),
    goToStudentDetail: (studentId) => push(`/secured/student/${studentId}`),
    prepareStudentsTableData: () => prepareStudentsTableData(),
    filterTable: (studentName, parentName, productId, productSku) => filterTable({studentName, parentName, productId, productSku})
}, dispatch)

export default connect(select, actions)(StudentsView);

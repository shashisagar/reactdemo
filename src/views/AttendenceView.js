import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Glyphicon, Pager, ControlLabel, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown } from 'react-bootstrap';
import Divider from '../components/Divider';
import DatePicker from '../components/DatePicker';
import { prepareProductList, updateAttendence, saveAttendence, prepareAttendanceHistoryData, prepareAttendanceTakeData } from '../modules/main'
import { bindActionCreators } from 'redux';
import Attendence from '../components/Attendence';
import {splitProductSku, joinProductSku} from '../utils';
import { push } from 'react-router-redux';
import '../styles/AttendanceView.css';
import PrintPage from '../components/PrintPage';
import StudentDetailView from './StudentDetailView';
import {HighlightedCell} from './HighlightedCell';
import { BeatLoader, ClipLoader } from 'react-spinners';
import Select from 'react-select';
import FileSaver from 'file-saver';
import axios from 'axios';
import { baseURL } from '../modules/service';

import 'react-select/dist/react-select.css';

import {
    SortingState,
    LocalSorting,
    PagingState,
    LocalPaging,
    RowDetailState,
    TableColumnResizing,
    SelectionState
} from '@devexpress/dx-react-grid';

import {
    Grid,
    TableView,
    TableHeaderRow,
    TableSelection,
    TableRowDetail,
    PagingPanel
} from '@devexpress/dx-react-grid-bootstrap3';

const styles = {
    root: {
        fontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
        fontWeight: 300,
    },
    header: {
        backgroundColor: '#2A598B',
        color: '#DCDCDC',
        padding: '16px',
        fontSize: '1.5em',
    }
};

class AttendanceView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.getInitialState(props),
            activeTab: 1
        };

        this.printHistory = this.printHistory.bind(this);
        this.onProductChanged = this.onProductChanged.bind(this);
        this.onAttendTakeDateChanged = this.onAttendTakeDateChanged.bind(this);
        this.handleTabSwitch = this.handleTabSwitch.bind(this);
        this.showStudentInfo = this.showStudentInfo.bind(this);
        this.hideStudentInfo = this.hideStudentInfo.bind(this);
        this.renderHistoryContent = this.renderHistoryContent.bind(this);
        this.renderAttendanceContent = this.renderAttendanceContent.bind(this);
        this.renderPrintAndDownload = this.renderPrintAndDownload.bind(this);
        this.prapareProductList = this.prapareProductList.bind(this);
        this.onProductHistoryChanged = this.onProductHistoryChanged.bind(this);
        this.changeSelection = this.changeSelection.bind(this);
        this.downloadClassList = this.downloadClassList.bind(this);
        this.downloadFiles = this.downloadFiles.bind(this);
        this.changeSorting = sorting => this.setState({ sorting });
    }

    getInitialState(props) {
        return({
            date: `${moment().locale('en').format('YYYY-MM-DD')}`,
            productIdSku: '',
            productHistoryIdSku: '',

            isSaving: false,
            isAttendanceSaved: false,
            expandedRows: [],
            showStudentDetail: false,
            selection: [],

            loadingProducts: false,
            loadingAttendance: false,
            laodingAttndHistory: false,

            attendanceTakeData: props ? props.attendanceTakeData : [],
            attenHistoryTblData: props ? props.attenHistoryTblData : [],
            attenHistoryPrintTblData: props ? props.attenHistoryPrintTblData: [],

            downloading: false,

            sorting: [{ columnName: 'name', direction: 'asc' }],

            groupName: 'ALL'
        });
    }

    changeSelection(selection) {
        var diff = selection.filter(x => this.state.selection.indexOf(x) < 0 );
        this.setState({ selection: diff }, () => {
            this.showStudentInfo(this.state.attenHistoryTblData.rows[selection[0]]);
        })
    }

    handleTabSwitch(eventKey) {
        this.setState({
            ...this.getInitialState(),
            activeTab: eventKey
        });
    }

    componentWillMount() {
        this.setState({
            loadingProducts: true,
            activeTab: 1,
        }, () => {
            this.props.fetchProducts().then(() => {
                this.setState({
                    loadingProducts: false
                })
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.attendanceTakeData !== this.state.attendanceTakeData) {
            this.setState({attendanceTakeData: nextProps.attendanceTakeData})
        }
        if(nextProps.attenHistoryTblData !== this.state.attenHistoryTblData) {
            this.setState({attenHistoryTblData: nextProps.attenHistoryTblData})
        }
        if(nextProps.attenHistoryPrintTblData !== this.state.attenHistoryPrintTblData) {
            this.setState({attenHistoryPrintTblData: nextProps.attenHistoryPrintTblData})
        }
        // if(nextProps.product !== this.state.product) {
        //     this.setState({product: nextProps.product})
        // }
        // if(nextProps.productHistory !== this.state.productHistory) {
        //     this.setState({productHistory: nextProps.productHistory})
        // }
    }

    // picked a new date from date picker
    onAttendTakeDateChanged(date) {
        this.setState({
            date: `${moment(date).locale('en').format('YYYY-MM-DD')}`,
            loadingAttendance: true
        }, () => {
            let {date:selectedDate, productIdSku} = this.state;
            let selectedProducts = productIdSku.split(',').map(product => (splitProductSku(product)));
            this.props.prepareAttendanceTakeData(selectedProducts, selectedDate).then(() => {
                this.setState({
                    loadingAttendance: false
                })
            });
        });
    }

    onGroupNameChanged = (groupName) => {
        if(groupName === null) groupName = 'ALL'
        this.setState({
            ...this.getInitialState(),
            groupName
        })
        if(groupName !== 'ALL') {
            let products = this.props.products;
            if(this.state.activeTab === 1) {
                products = Object.values(products).filter(product => product.active);
            }
            products = Object.values(products).filter(product => product.groupName && product.groupName === groupName);
            products = Object.values(products).map(product => joinProductSku(product.productPK))
            products = products.join(',')
            if(this.state.activeTab === 1) {
                this.onProductChanged(products)
            } else if(this.state.activeTab === 2) {
                this.onProductHistoryChanged(products)
            }
        }
    }

    // selected a new product from opetions menu
    onProductChanged(productIdSku) {
        if(productIdSku === ''){
            this.setState({productIdSku});
            return;
        }
        this.setState({
            productIdSku,
            activeTab: 1,
            date: `${moment().locale('en').format('YYYY-MM-DD')}`,
            loadingAttendance: true
        }, () => {
            let {date:selectedDate, productIdSku} = this.state;
            let selectedProducts = productIdSku.split(',').map(product => (splitProductSku(product)));
            this.props.prepareAttendanceTakeData(selectedProducts, selectedDate).then(() => {
                this.setState({
                    loadingAttendance: false
                })
            });
        });
    }

    onProductHistoryChanged(productHistoryIdSku) {
        if(productHistoryIdSku === ''){
            this.setState({productHistoryIdSku});
            return;
        }
        this.setState({
            productHistoryIdSku,
            activeTab: 2,
            laodingAttndHistory: true,
            expandedRows: []
        }, () => {
            let {productHistoryIdSku} = this.state;
            let selectedProducts = productHistoryIdSku.split(',').map(product => (splitProductSku(product)));
            this.props.prepareAttendanceHistoryData(selectedProducts).then(() => {
                this.setState({
                    laodingAttndHistory: false
                })
            })
        });
    }

    tableCellTemplate({ row, column, style }){
        //if (column.name !== 'name') {
            return (
                <HighlightedCell align={column.align} row={row} column={column.name} style={style} />
            );
        //}
        //return undefined;
    };

    showStudentInfo(student) {
        this.setState({
            showStudentDetail: true,
            selectedStudent: student
        })
    }

    hideStudentInfo() {
        this.setState({
            showStudentDetail: false,
            selectedStudent: null,
            selection: []
        })
    }

    renderAttendanceContent() {
        const {productIdSku, date} = this.state;
        let disableContent = {pointerEvents: 'none', opacity: '0.3'};
        return (
            <div>
                <div>
                    <ControlLabel>{'Select Product & Date'}</ControlLabel>
                    <Row className="show-grid align-left">
                        <Col xs={12} md={3} sm={12}>
                            <FormGroup controlId="formControlsSelect">
                                <Select
                                    matchPos={'any'}
                                    matchProp={'label'}
                                    multi={false}
                                    simpleValue
                                    disabled={this.state.loadingAttendance || this.state.loadingProducts}
                                    placeholder={'Group Name'}
                                    isLoading={this.state.loadingProducts}
                                    name="form-field-name"
                                    clearable={false}
                                    value={this.state.groupName}
                                    onChange={this.onGroupNameChanged}
                                    options={this.prepareGroupList(false)} />
                            </FormGroup>
                        </Col>
                        <Col xs={12} md={5} sm={12}>
                            <FormGroup controlId="formControlsSelect">
                                <Select
                                    matchPos={'any'}
                                    matchProp={'label'}
                                    multi={true}
                                    simpleValue
                                    disabled={this.state.loadingAttendance || this.state.loadingProducts}
                                    placeholder={'Search by product name or sku'}
                                    isLoading={this.state.loadingProducts}
                                    name="form-field-name"
                                    value={this.state.productIdSku}
                                    onChange={this.onProductChanged}
                                    options={this.prapareProductList(false)} />
                            </FormGroup>
                        </Col>
                        <Col xs={12} md={4} sm={12}>
                            <FormGroup controlId="formControlsSelect">
                                <DatePicker disabled={this.state.loadingAttendance || this.state.loadingProducts || this.state.productIdSku === ''} dateFormat="DD/MM/YYYY" onChange={this.onAttendTakeDateChanged} value={this.state.date} />
                            </FormGroup>
                        </Col>
                    </Row>
                </div>

                {
                    (this.state.productIdSku !== '' && !this.state.loadingAttendance) &&
                    <div>
                        {
                            this.state.attendanceTakeData.length > 0 &&
                            <div>
                                <div style={this.state.loadingAttendance ? disableContent : {}}>
                                    <Attendence onStudentInfoClicked={this.showStudentInfo} enrolments={this.state.attendanceTakeData} onUpdate={(index, attended, student) => {
                                        const {order:{productId, productSku, studentId}} = student;
                                        this.props.updateAttendence(index, attended, productId, productSku, date).then(() => {
                                            // this.setState({
                                            //     attendanceTakeDataTmp: [
                                            //         ...this.state.attendanceTakeData.slice(0, index),
                                            //         {
                                            //             ...this.state.attendanceTakeData[index],
                                            //             attended: attended === 0 ? false : true,
                                            //         },
                                            //         ...this.state.attendanceTakeData.slice(index + 1),
                                            //     ]
                                            // })
                                        }).catch(error => {})
                                    }}/>
                                    <Divider />
                                </div>
                            </div>
                        }
                        {
                            this.state.attendanceTakeData.length === 0 && this.renderNoData(`No enrolments found for the selected product(s)`)
                        }
                    </div>
                }
            </div>
        )
    }

    renderHistoryContent() {
        const { rows:historyRows, columns:historyColumns, columnsWidth } = this.state.attenHistoryTblData;
        return (
            <div>
                <ControlLabel>{'Select Product'}</ControlLabel>
                <Row className="show-grid align-left">
                    <Col xs={12} md={3} sm={12}>
                        <FormGroup controlId="formControlsSelect">
                            <Select
                                matchPos={'any'}
                                matchProp={'label'}
                                multi={false}
                                simpleValue
                                disabled={this.state.laodingAttndHistory || this.state.loadingProducts}
                                placeholder={'Group Name'}
                                isLoading={this.state.loadingProducts}
                                name="form-field-name"
                                clearable={false}
                                value={this.state.groupName}
                                onChange={this.onGroupNameChanged}
                                options={this.prepareGroupList(true)} />
                        </FormGroup>
                    </Col>
                    <Col xs={12} md={9} sm={12}>
                        <FormGroup controlId="formControlsSelect">
                            <Select
                                matchPos={'any'}
                                matchProp={'label'}
                                multi={true}
                                simpleValue
                                disabled={this.state.laodingAttndHistory || this.state.loadingProducts}
                                placeholder={'Search by product name or sku'}
                                isLoading={this.state.loadingProducts}
                                name="form-field-name"
                                value={this.state.productHistoryIdSku}
                                onChange={this.onProductHistoryChanged}
                                options={this.prapareProductList(true)} />
                        </FormGroup>
                    </Col>
                </Row>
                {
                    this.state.productHistoryIdSku !== '' && typeof historyRows !== 'undefined' && typeof historyColumns !== 'undefined' && !this.state.laodingAttndHistory &&
                    <div>
                        {
                            this.state.attenHistoryTblData.rows && this.state.attenHistoryTblData.rows.length > 0 &&
                            <div>
                                <div className="pull-left">
                                    <p>Showing history results</p>
                                </div>
                                <div className="pull-right">
                                    {this.renderPrintAndDownload()}
                                </div>
                                {
                                    this.state.downloading &&
                                    <div className="pull-right" style={{marginRight: 10, marginTop: 5}}>
                                        <ClipLoader color={'#000'} size={20} loading={true} />
                                    </div>
                                }
                                <div className="clearfix" />
                                <Divider />
                                <Grid rows={historyRows} columns={historyColumns} >

                                    <SortingState sorting={this.state.sorting} onSortingChange={this.changeSorting} />
                                    <LocalSorting />

                                    <SelectionState selection={this.state.selection} onSelectionChange={this.changeSelection} />

                                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                                    <LocalPaging />
                                    <PagingPanel />
                                    <TableView tableCellTemplate={this.tableCellTemplate} />
                                    <TableColumnResizing defaultColumnWidths={columnsWidth} />
                                    <TableSelection selectByRowClick showSelectionColumn={false} />
                                    <TableHeaderRow allowSorting />
                                </Grid>
                            </div>
                        }
                        {
                            this.state.attenHistoryTblData.rows && this.state.attenHistoryTblData.rows.length === 0 &&
                            this.renderNoData(`No history found for the selected product(s)`)
                        }

                    </div>
                }
            </div>
        )
    }

    // <RowDetailState
        // expandedRows={this.state.expandedRows}
        // onExpandedRowsChange={(expandedRows) => {
        //     var diff = expandedRows.filter(x => this.state.expandedRows.indexOf(x) < 0 );
        //     this.setState({ expandedRows: diff })
        // }} />
    // <TableRowDetail template={({row}) => <StudentDetailView studentId={row.studentId} onClose={() => {this.setState({expandedRows: []})}}/>} />

    renderStudentDetailsModal() {
        const {selectedStudent} = this.state;
        return (
            <Modal bsSize="large" aria-labelledby="contained-modal-title-lg" show={this.state.showStudentDetail} onHide={this.hideStudentInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>{`${selectedStudent.firstName} ${selectedStudent.lastName}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StudentDetailView studentId={selectedStudent.id} onClose={() => {}}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.hideStudentInfo}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    renderPrintAndDownload() {
        return (
            <ButtonGroup >
                <Button bsSize="small" onClick={this.printHistory}><Glyphicon glyph="print" />{' Print'}</Button>
                <DropdownButton onSelect={eventKey => {this.downloadClassList(eventKey).then(() => {this.setState({downloading: false})}) }} bsSize="small" title="Download Class List" id="bg-nested-dropdown">
                  <MenuItem className={this.state.downloading ? 'disabled' : ''} eventKey="pdf"><Glyphicon glyph="file" />{' PDF'}</MenuItem>
                </DropdownButton>
                <DropdownButton onSelect={eventKey => {this.downloadFiles(eventKey).then(() => {this.setState({downloading: false})}) }} bsSize="small" title="Download Attendance" id="bg-nested-dropdown">
                  <MenuItem className={this.state.downloading ? 'disabled' : ''} eventKey="pdf"><Glyphicon glyph="file" />{' PDF'}</MenuItem>
                  <MenuItem className={this.state.downloading ? 'disabled' : ''} eventKey="xls"><Glyphicon glyph="file" />{' Excel'}</MenuItem>
                </DropdownButton>
             </ButtonGroup>
        )
    }

    downloadClassList(format) {
        if(this.state.downloading) return;
        this.setState({downloading: true});
        const { productHistoryIdSku } = this.state;
        let selectedProducts = productHistoryIdSku.split(',').map(product => (splitProductSku(product)));
        return axios.post(`${baseURL}/students/download?format=${format}`, selectedProducts, {headers:{'Accept':'*/*'},responseType: 'blob'})
        .then(function(response) {
            return response.data;
        })
        .then(function(blob) {
            FileSaver.saveAs(blob, `StemMindsClassList.${format}`);
        })
    }

    downloadFiles(format) {
        if(this.state.downloading) return;
        this.setState({downloading: true});
        const { productHistoryIdSku } = this.state;
        let selectedProducts = productHistoryIdSku.split(',').map(product => (splitProductSku(product)));
        return axios.post(`${baseURL}/attendance/download?format=${format}`, selectedProducts, {headers:{'Accept':'*/*'}, responseType: 'blob'})
        .then(function(response) {
            return response.data;
        })
        .then(function(blob) {
            FileSaver.saveAs(blob, `StemMindsAttendance.${format}`);
        })
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

    renderNoData(msg) {
        return (
            <div>
                <Divider />
                <center><span style={{color: '#000', fontSize: 16}}>{msg}</span></center>
                <Divider />
            </div>
        )
    }

    prepareGroupList = (history) => {
        let products = this.props.products;
        if(!history) {
            products = Object.values(products).filter(product => product.active);
        }
        let groups = new Set()
        if(products.length > 0)
        groups = products.reduce((acc, val, index) => {
            if(index === 1) acc = new Set()
            if(val.groupName) acc.add(val.groupName)
            return acc
        })
        groups = [...groups]
        groups = groups.map(value => ({ value, label: value}))
        groups.unshift({ value: 'ALL', label: 'All Groups'})
        return groups
    }

    prapareProductList(history) {
        let products = this.props.products;
        if(!history) {
            products = Object.values(products).filter(product => product.active);
        }
        if(this.state.groupName !== 'ALL') {
            products = Object.values(products).filter(product => product.groupName && product.groupName === this.state.groupName);
        }
        return Object.values(products).map(({productPK, name}) => ({ value: joinProductSku(productPK), label: `${name} ${productPK.sku ? '(SKU: '+productPK.sku+')' : ''}`}));
    }

    render() {
        if (!this.state.loadingProducts && this.props.products.length === 0 && this.renderNoData('No Products Found'));
        return (
            <div>
                <Nav bsStyle="tabs" activeKey={this.state.activeTab} onSelect={this.handleTabSwitch}>
                    <NavItem eventKey={1} title={'Take Attendance'}>{'Take Attendance'}</NavItem>
                    <NavItem eventKey={2} title={'Attendance History'}>{'Attendance History'}</NavItem>
                </Nav>
                <Divider/>
                {this.state.activeTab === 1 && this.renderAttendanceContent()}
                {this.state.activeTab === 2 && this.renderHistoryContent()}
                {(this.state.loadingAttendance || this.state.laodingAttndHistory) && this.renderLoadingContent()}
                {this.state.selectedStudent && this.renderStudentDetailsModal()}
            </div>
        )
    }
    printHistory() {
        let { attenHistoryPrintTblData:data } = this.state;
        PrintPage({header: `<h1>Attendance History</h1>`, printable: data.rows, properties: data.columns, type: 'json'})
    }
}

const select = (store, ownProps) => ({
    ownProps: ownProps,
    product: store.main.product,
    productHistory: store.main.productHistory,
    products: store.service.products,
    attendanceTakeData: store.main.attendanceTakeData,
    attenHistoryTblData: store.main.attenHistoryTblData,
    attenHistoryPrintTblData: store.main.attenHistoryPrintTblData
});

const actions = dispatch => bindActionCreators({
    fetchProducts: () => prepareProductList(),
    prepareAttendanceTakeData: (selectedProducts, selectedDate) => prepareAttendanceTakeData({selectedProducts, selectedDate}),
    prepareAttendanceHistoryData: (selectedProducts) => prepareAttendanceHistoryData({selectedProducts}),
    updateAttendence: (index, attended, productId, productSku, date) => updateAttendence({index, attended, productId, productSku, date}),
    saveAttendence: (productId, date) => saveAttendence({productId, date})
}, dispatch)

export default connect(select, actions)(AttendanceView);

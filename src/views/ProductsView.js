import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'
import {prepareProductTableData, saveProductDetails, filterProductTable} from '../modules/main';
import { BeatLoader } from 'react-spinners';
import Divider from '../components/Divider';
import DatePicker from '../components/DatePicker';
import moment from 'moment';
import {
    Table,
    Panel,
    Pager,
    ControlLabel,
    Modal,
    FormGroup,
    FormControl,
    Form,
    Button,
    ButtonToolbar,
    Alert,
    ButtonGroup,
    DropdownButton,
    MenuItem,
    ToggleButtonGroup,
    ToggleButton,
    Col,
    Row,
    Nav,
    NavItem,
    NavDropdown,
    Grid as BGrid
} from 'react-bootstrap';

import {
    SortingState,
    LocalSorting,
    EditingState,
    PagingState,
    LocalPaging,
    RowDetailState,
    LocalFiltering,
    LocalGrouping,
    FilteringState,
    TableColumnResizing,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    TableView,
    TableHeaderRow,
    PagingPanel,
    TableRowDetail,
    TableEditRow,
    TableEditColumn,
    GroupingPanel
} from '@devexpress/dx-react-grid-bootstrap3';

import ProductDetailView from './ProductDetailView';
import {HighlightedProductTableCell} from './HighlightedCell';

const commands = {
    edit: {
        // icon: 'pencil',
        text: 'Edit',
        hint: 'Edit row',
    },
    commit: {
        // icon: 'ok',
        text: 'Save',
        hint: 'Save changes',
    },
    cancel: {
        icon: 'remove',
        hint: 'Cancel changes',
        isDanger: true,
    }
}

const CommandButton = ({executeCommand, icon, text, hint, isDanger}) => (
    <button className="btn btn-link" title={hint} onClick={(e) => {
            executeCommand();
            e.stopPropagation();
        }}>
        <span className={isDanger ? 'text-danger' : undefined}>
            {icon ? <i className={`glyphicon glyphicon-${icon}`} style={{ marginRight: text ? 5 : 0 }} /> : null}
            {text}
        </span>
    </button>
);

export const DatePickerEditCell = ({value, onValueChange, column, rowId}) => {

    var position = ((rowId % 10) < 5) ? 'bottom' : 'top';
    return (
        <td style={{ verticalAlign: 'middle', padding: 1}}>
            <DatePicker overlayPositionAbs={true} calendarPlacement={() => (position)} style={{textAlign: column.align}} disabled={false} dateFormat="YYYY-MM-DD" onChange={value => onValueChange(value)} value={value} />
        </td>
    )
}

export const NonEditCell = ({value, style, align}) => (
    <td style={{textAlign: align, ...style}}>
        {value}
    </td>
);

class ProductsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingProductTableData: false,
            loadingUpdateProduct: false,
            productSaveRespMsg: null,
            rows: [],
            columns: [],
            expandedRows: [],
            editingRows: [],
            changedRows: {},
            productName: ''
        };
        this.loadData = this.loadData.bind(this);
        this.renderLoadingContent = this.renderLoadingContent.bind(this);
        this.renderProductsTable = this.renderProductsTable.bind(this);
        this.renderNoData = this.renderNoData.bind(this);
        this.showAlertMessage = this.showAlertMessage.bind(this);
        this.validationInputField = this.validationInputField.bind(this);
        this.handleFilterProduct = this.handleFilterProduct.bind(this);

        this.changeChangedRows = changedRows => this.setState({ changedRows });
        this.changeEditingRows = editingRows => this.setState({ editingRows });
        this.commitChanges = ({ added, changed, deleted }) => {
            let { rows } = this.state;
            if (changed && changed[Object.keys(changed)[0]]) {

                let { numOfSessions,inventory } = changed[Object.keys(changed)[0]];

                if (numOfSessions){
                    changed[Object.keys(changed)[0]].numOfSessions = isNaN(parseInt(numOfSessions)) ? 0 : parseInt(numOfSessions);
                }

                if(inventory){
                    changed[Object.keys(changed)[0]].inventory = isNaN(parseInt(inventory)) ? 0 : parseInt(inventory);
                }

                let {id, productId, sku} = rows.find(row => changed[row.id]);
                let productPatch = {...changed[id]}

                this.setState({
                    loadingUpdateProduct: true
                }, () => {
                    this.props.saveProductDetails(productId, sku, productPatch).then(() => {
                        let productSaveRespMsg = {};
                        productSaveRespMsg.type = 'success';
                        productSaveRespMsg.text = `Product updated successfully.`
                        this.setState({
                            loadingUpdateProduct: false,
                            productSaveRespMsg
                        });
                    }).catch(() => {
                        let productSaveRespMsg = {};
                        productSaveRespMsg.type = 'danger';
                        productSaveRespMsg.text = `Product update failed.`

                        this.setState({
                            loadingUpdateProduct: false,
                            productSaveRespMsg
                        });
                    });
                })

                rows = rows.map(row => {
                    if(changed[row.id]) {
                        if(changed[row.id].startDate) {
                            changed[row.id].startDate = `${moment(changed[row.id].startDate).locale('en').format('YYYY-MM-DD')}`
                        }
                        if(changed[row.id].endDate) {
                            changed[row.id].endDate = `${moment(changed[row.id].endDate).locale('en').format('YYYY-MM-DD')}`
                        }
                        return {
                            ...row,
                            ...changed[row.id]
                        }
                    }
                    return row;
                });
            }
            this.setState({ rows });
        };
        this.commandTemplate = ({ executeCommand, id }) => (
            commands[id]
            ? <CommandButton executeCommand={executeCommand} {...commands[id]} />
            : undefined
        );
        this.editCellTemplate = (props) => {
            let { column, value, style, align, onValueChange, tableRow} = props;
            if(column.name === 'startDate' || column.name === 'endDate') {
                return (
                    <DatePickerEditCell column={column} rowId={tableRow.rowId} value={value} onValueChange={onValueChange} />
                );
            }

            if(column.name === 'numOfSessions' || column.name === 'inventory' || column.name === 'groupName') return undefined;

            return (
                <NonEditCell value={value} style={style} align={column.align} />
            );
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.productsTblData !== this.props.productsTblData) {
            this.setState({
                rows: nextProps.productsTblData.rows ? nextProps.productsTblData.rows : [],
                columns: nextProps.productsTblData.columns ? nextProps.productsTblData.columns : []
            })
        }
    }

    loadData() {
        this.setState({
            loadingProductTableData: true
        }, () => {
            this.props.prepareProductTableData().then(() => {
                this.setState({
                    loadingProductTableData: false
                });
            })
        })
    }

    componentDidMount() {
        this.loadData();
    }

    tableCellTemplate({ row, column, style }){
        if (column.name === 'sku' || column.name === 'name') {
            return (
                <HighlightedProductTableCell align={column.align} row={row} column={column.name} style={style} />
            );
        }
        return undefined;
    };

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
                <center><h4>{msg}</h4></center>
                <Divider />
            </div>
        )
    }

    showAlertMessage() {
        const {type, text} = this.state.productSaveRespMsg;
        return (
            <Alert bsStyle={type} onDismiss={() => {
                this.setState({
                    productSaveRespMsg: null
                })
            }}>
                {type === 'danger' && <h4>You got an error!</h4>}
                {type === 'success' && <h4>Successful!</h4>}
                <p>{text}</p>
            </Alert>
        )
    }

    changeSorting(sorting) {
        console.log(sorting);
    }

    renderProductsTable() {
        return (
            <div>
                <Grid rows={this.state.rows} columns={this.state.columns} >

                    <SortingState />
                    <LocalSorting />

                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <LocalPaging showSortingControls />

                    <EditingState
                        editingRows={this.state.editingRows}
                        onEditingRowsChange={this.changeEditingRows}
                        changedRows={this.state.changedRows}
                        onChangedRowsChange={this.changeChangedRows}
                        onCommitChanges={this.commitChanges} />

                    <TableView tableCellTemplate={this.tableCellTemplate} />
                    <TableColumnResizing defaultColumnWidths={{name: 250, sku: 200, startDate: 120, endDate: 120, numOfSessions: 100, inventory: 100, numOfEnrollments: 100, groupName: 100}} />
                    <TableHeaderRow allowSorting />

                    <TableEditRow editCellTemplate={this.editCellTemplate} />

                    <TableEditColumn
                        width={100}
                        allowEditing
                        commandTemplate={this.commandTemplate} />

                    <PagingPanel showSortingControls />

                </Grid>
            </div>
        )
    }

/*
    <RowDetailState
        expandedRows={this.state.expandedRows}
        onExpandedRowsChange={(expandedRows) => {
            var diff = expandedRows.filter(x => this.state.expandedRows.indexOf(x) < 0 );
            this.setState({ expandedRows: diff })
        }}
    />
    <TableRowDetail template={({row}) => <ProductDetailView productId={row.id} onClose={() => {this.setState({expandedRows: []})}}/>} />
*/

    validationInputField(value) {
        if(value === '') return true;
        var regex = new RegExp("^[ A-Za-z0-9_@./#&+-]+$");
        if (regex.test(value)) {
            return true;
        }
        return false;
    }

    handleFilterProduct(event) {
        let { value:productName } = event.target;
        if(!this.validationInputField(productName)) return
        this.setState({productName, expandedRows:[]}, () => {
            this.filterTable();
        });
    }

    filterTable() {
        const { productName } = this.state;
        this.props.filterProductTable(productName);
    }

    renderFormContent() {
        return (
            <div>
                <Row className="show-grid align-left">
                    <Col xs={12} md={12}>
                        <FormGroup controlId="formControlsSelect">
                            <FormControl type="text" value={this.state.productName} placeholder="Search by product name or sku" onChange={this.handleFilterProduct} />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.state.productSaveRespMsg && this.showAlertMessage()}
                {(this.state.loadingProductTableData || this.state.loadingUpdateProduct) && this.renderLoadingContent()}
                {!this.state.loadingProductTableData && this.renderFormContent()}
                {!this.state.loadingProductTableData && this.renderProductsTable()}
            </div>
        );
    }
}

const select = store => ({
    productsTblData: store.main.productsTblData
});
const actions = dispatch => bindActionCreators({
    prepareProductTableData: () => prepareProductTableData(),
    saveProductDetails: (productId, productSku, data) => saveProductDetails({productId, productSku, data}),
    filterProductTable: (productName) => filterProductTable({productName})
}, dispatch)
export default connect(select, actions)(ProductsView);

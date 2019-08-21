import React from 'react';
import PropTypes from 'prop-types';

import {
    SortingState, EditingState, PagingState,
    LocalPaging, LocalSorting,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    TableView, TableHeaderRow, TableEditRow, TableEditColumn,
    PagingPanel, DragDropContext, TableColumnReordering,
} from '@devexpress/dx-react-grid-bootstrap3';

import {
    Modal,
    Button,
} from 'react-bootstrap';

import {
    generateRows,
    globalSalesValues,
} from './demo/generator';


const CommandButton = ({
    executeCommand, icon, text, hint, isDanger,
}) => (
    <button className="btn btn-link" title={hint} onClick={(e) => {
            executeCommand();
            e.stopPropagation();
        }} >
        <span className={isDanger ? 'text-danger' : undefined}>
            {icon ? <i className={`glyphicon glyphicon-${icon}`} style={{ marginRight: text ? 5 : 0 }} /> : null}
            {text}
        </span>
    </button>
);


const commands = {
    add: {
        text: 'New',
        hint: 'Create new row',
        icon: 'plus',
    },
    edit: {
        text: 'Edit',
        hint: 'Edit row',
    },
    delete: {
        icon: 'trash',
        hint: 'Delete row',
        isDanger: true,
    },
    commit: {
        text: 'Save',
        hint: 'Save changes',
    },
    cancel: {
        icon: 'remove',
        hint: 'Cancel changes',
        isDanger: true,
    },
};

export const LookupEditCell = ({
    column, value, onValueChange, availableValues,
}) => (
    <td style={{
        verticalAlign: 'middle',
        padding: 1,
    }} >
        <select className="form-control" style={{ width: '100%', textAlign: column.align }} value={value} onChange={e => onValueChange(e.target.value)}>
            {availableValues.map(val => <option key={val} value={val}>{val}</option>)}
        </select>
    </td>
);


const availableValues = {
    product: globalSalesValues.product,
    region: globalSalesValues.region,
    customer: globalSalesValues.customer,
};

const getRowId = row => row.id;

export default class Demo extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                { name: 'product', title: 'Product' },
                { name: 'region', title: 'Region' },
                { name: 'amount', title: 'Sale Amount', align: 'right' },
                { name: 'discount', title: 'Discount' },
                { name: 'saleDate', title: 'Sale Date' },
                { name: 'customer', title: 'Customer' },
            ],
            rows: generateRows({
                columnValues: { id: ({ index }) => index, ...globalSalesValues },
                length: 12,
            }),
            sorting: [],
            editingRows: [],
            addedRows: [],
            changedRows: {},
            currentPage: 0,
            deletingRows: [],
            pageSize: 0,
            allowedPageSizes: [5, 10, 0]
        };

        this.changeChangedRows = changedRows => this.setState({ changedRows });
        this.changeCurrentPage = currentPage => this.setState({ currentPage });
        this.changePageSize = pageSize => this.setState({ pageSize });
        this.commitChanges = ({ added, changed, deleted }) => {
            let { rows } = this.state;
            if (added) {
                const startingAddedId = (rows.length - 1) > 0 ? rows[rows.length - 1].id + 1 : 0;
                rows = [
                    ...rows,
                    ...added.map((row, index) => ({
                        id: startingAddedId + index,
                        ...row,
                    })),
                ];
            }
            if (changed) {
                rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
            }
            this.setState({ rows, deletingRows: deleted || this.state.deletingRows });
        };
        this.cancelDelete = () => this.setState({ deletingRows: [] });
        this.deleteRows = () => {
            const rows = this.state.rows.slice();
            this.state.deletingRows.forEach((rowId) => {
                const index = rows.findIndex(row => row.id === rowId);
                if (index > -1) {
                    rows.splice(index, 1);
                }
            });
            this.setState({ rows, deletingRows: [] });
        };
        this.changeColumnOrder = (order) => {
            this.setState({ columnOrder: order });
        };

        this.tableCellTemplate = ({ row, column, style }) => {
            // if (column.name === 'discount') {
            //     return (
            //         <ProgressBarCell value={row.discount * 100} style={style} />
            //     );
            // } else if (column.name === 'amount') {
            //     return (
            //         <HighlightedCell align={column.align} value={row.amount} style={style} />
            //     );
            // }
            return undefined;
        };
        this.editCellTemplate = ({ column, value, onValueChange }) => {
            const columnValues = availableValues[column.name];
            if (columnValues) {
                return (
                    <LookupEditCell
                        column={column}
                        value={value}
                        onValueChange={onValueChange}
                        availableValues={columnValues} />
                );
            }
            return undefined;
        };
        // this.commandTemplate = ({ executeCommand, id }) => (commands[id] ? <CommandButton executeCommand={executeCommand} {...commands[id]} /> : undefined);
        this.commandTemplate = ({ executeCommand, id }) => {
            debugger;
            return (commands[id] ? <CommandButton executeCommand={executeCommand} {...commands[id]} /> : undefined)
        };
    }
    render() {
        const {
            rows,
            columns,
            sorting,
            editingRows,
            addedRows,
            changedRows,
            currentPage,
            deletingRows,
            pageSize,
            allowedPageSizes,
            columnOrder,
        } = this.state;

        return (
            <div>
                <Grid rows={rows} columns={columns} getRowId={getRowId}>

                    <EditingState editingRows={editingRows} onEditingRowsChange={this.changeEditingRows} changedRows={changedRows} onChangedRowsChange={this.changeChangedRows}
                        addedRows={addedRows} onAddedRowsChange={this.changeAddedRows} onCommitChanges={this.commitChanges}/>

                    <TableView tableCellTemplate={this.tableCellTemplate}/>

                    <TableHeaderRow  />

                    <TableEditColumn width={100} allowDeleting allowEditing commandTemplate={this.commandTemplate}/>

                </Grid>

                <Modal bsSize="large" show={!!deletingRows.length} onHide={this.cancelDelete}>

                    <Modal.Header closeButton>
                        <Modal.Title>Delete Row</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>Are you sure to delete the following row?</p>
                        <Grid rows={rows.filter(row => deletingRows.indexOf(row.id) > -1)} columns={columns}>
                            <TableView tableCellTemplate={this.tableCellTemplate}/>
                            <TableHeaderRow />
                        </Grid>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.cancelDelete}>Cancel</Button>
                        <Button className="btn-danger" onClick={this.deleteRows}>Delete</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

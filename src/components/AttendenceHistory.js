
import React from 'react';
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

export default class AttendenceHistory extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                { name: 'name', title: 'Name' },
                { name: 'pphone', title: '12/11/2017' }
            ],
            rows: [
                { name:"Melina Costa", pphone: "Present" },
                { name:"Noah Jornacion", pphone: "Present" },
                { name:"Victoria Omere", pphone: "Present" },
                { name:"Angelica Medoro", pphone: "Present" },
                { name:"Janice Edos", pphone: "Present" },
                { name:"John Manuel", pphone: "Present" },
                { name:"Reese Frank", pphone: "Present" },
                { name:"Noh Sturges", pphone: "Present" },
                { name:"Alex Sampson", pphone: "Present" },
                { name:"Thomas Harrison", pphone: "Present" },
                { name:"Jewel Bloemen", pphone: "Present" },
                { name:"Sophie Baroco", pphone: "Present" },
                { name:"Wilder Graham", pphone: "Present" },
                { name:"Sofia Hernandez", pphone: "Present" }
            ],
            allowedPageSizes: [10, 20, 0],
        };
    }

    render() {
        const { rows, columns, allowedPageSizes } = this.state;
        return (
            <Grid rows={rows} columns={columns} >
                <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                <LocalPaging />
                <TableView />
                <TableHeaderRow />
                <PagingPanel allowedPageSizes={allowedPageSizes} />
            </Grid>
        );
    }
}

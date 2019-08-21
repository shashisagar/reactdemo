import React from 'react';
export default ({ location }) => (
    <div style={{padding: 20}}>
        <p>No match for <code>{location.pathname}</code></p>
    </div>
);

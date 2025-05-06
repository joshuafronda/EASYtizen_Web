// src/pages/RequestDoc.jsx
import React from 'react';
import Header from '../components/common/Header';
import RequestTable from '../components/Request/RequestTable'; // Import the RequestTable component

const RequestDoc = ({ user }) => {
  return (
    <div className="flex-1">
      <Header title="Monitoring of Request" barangayId={user.barangayId} user={user} />
      {/* Include the RequestTable component and pass the barangayId prop */}
      <RequestTable barangayId={user.barangayId} user={user}/>
    </div>
  );
}

export default RequestDoc;
// src/pages/RequestDoc.jsx
import React from 'react';
import Header from '../components/common/Header';
import ResidencyTable from '../components/Request/ResidencyTable';

const ResidencyDoc = ({ user }) => {
  return (
    <div className="flex-1">
      <Header title="Certificate of Residency" barangayId={user.barangayId} user={user} />
      {/* Include the RequestTable component and pass the barangayId prop */}
      <ResidencyTable barangayId={user.barangayId} user={user}/>
    </div>
  );
}

export default ResidencyDoc;
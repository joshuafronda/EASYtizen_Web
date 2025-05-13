import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from '../components/common/Header';
import BarangayTable from '../components/Officials/BarangayTable';

const BrgyOfficial = ({ user }) => {
  const [officials, setOfficials] = useState([]);

  useEffect(() => {
    const fetchOfficials = async () => {
      if (user && user.barangayId) {
        const q = query(collection(db, 'barangayOfficials'), where('barangayId', '==', user.barangayId));
        const querySnapshot = await getDocs(q);
        const officialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOfficials(officialsData);
      }
    };

    fetchOfficials();
  }, [user]);

  return (
    <div className="flex-1">
      <Header title="Barangay Officials" user={user} />
      <BarangayTable officials={officials} user={user} />
    </div>
  );
};

export default BrgyOfficial;
import React from 'react';
import Modal from 'react-modal'; // Ensure you have react-modal installed
import DemographicsChart from './DemographicsChart';
import EmploymentChart from './EmploymentChart';
import RegisteredVotersChart from './RegisteredVotersChart';

const ChartModal = ({ isOpen, onRequestClose, chartType, data }) => {
  const renderChart = () => {
    switch (chartType) {
      case 'demographics':
        return <DemographicsChart data={data} />;
      case 'employment':
        return <EmploymentChart data={data} />;
      case 'registeredVoters':
        return <RegisteredVotersChart data={data} />;
      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <button 
        onClick={onRequestClose} 
        className="mb-4 text-red-500 hover:text-red-700"
      >
        Close
      </button>
      {renderChart()}
    </Modal>
  );
};

export default ChartModal;
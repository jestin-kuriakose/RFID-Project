import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { API_URL } from '../constants';
import EditPassengerModal from '../components/modal/EditPassengerModal';
import DeleteConfirmationModal from '../components/modal/DeletePassengerModal';

const AllLuggages = ({selectedPrinter}) => {
  const [passengers, setPassengers] = useState([]);
  const [rfidFilter, setRfidFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async (filter = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/passengers${filter ? `?rfidTag=${filter}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch passengers');
      }
      const data = await response.json();
      setPassengers(data);
    } catch (error) {
      setError('Error fetching passengers. Please try again.');
      console.error('Error fetching passengers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setRfidFilter(e.target.value);
  };

  const applyFilter = () => {
    fetchPassengers(rfidFilter);
  };

  const openEditModal = (passenger) => {
    setSelectedPassenger(passenger);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPassenger(null);
  };

  const openDeleteModal = (passenger) => {
    setSelectedPassenger(passenger);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPassenger(null);
  };

  const handleSavePassenger = (updatedPassenger) => {
    setPassengers(passengers.map(p => p.id === updatedPassenger.id ? updatedPassenger : p));
    closeEditModal();
  };

  const handleDeletePassenger = async () => {
    try {
      const response = await fetch(`${API_URL}/api/passenger/${selectedPassenger.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPassengers(passengers.filter(p => p.id !== selectedPassenger.id));
        closeDeleteModal();
      } else {
        throw new Error('Failed to delete passenger');
      }
    } catch (error) {
      setError('Error deleting passenger. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="passenger-list-container">
      <h2 className="mb-4">Registered Passengers</h2>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Form className="mb-4">
        <InputGroup>
          <Form.Control 
            type="text" 
            placeholder="Enter RFID Tag to filter" 
            value={rfidFilter}
            onChange={handleFilterChange}
          />
          <Button variant="primary" onClick={applyFilter}>
            <FaSearch /> Filter
          </Button>
        </InputGroup>
      </Form>

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive className="passenger-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Flight Number</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>RFID Tag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger) => (
              <tr key={passenger.id}>
                <td>{passenger.firstName}</td>
                <td>{passenger.lastName}</td>
                <td>{passenger.email}</td>
                <td>{passenger.flightNumber}</td>
                <td>{passenger.departureLocation}</td>
                <td>{passenger.arrivalLocation}</td>
                <td>{passenger.rfidTag || 'N/A'}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(passenger)}>
                    <FaEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(passenger)}>
                    <FaTrash /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <EditPassengerModal
        show={showEditModal}
        handleClose={closeEditModal}
        passenger={selectedPassenger}
        onSave={handleSavePassenger}
        selectedPrinter={selectedPrinter}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={closeDeleteModal}
        handleConfirm={handleDeletePassenger}
        passengerName={selectedPassenger ? `${selectedPassenger.firstName} ${selectedPassenger.lastName}` : ''}
      />
    </div>
  );
};

export default AllLuggages;

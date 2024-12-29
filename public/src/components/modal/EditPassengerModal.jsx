import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { API_URL } from '../../constants';

const EditPassengerModal = ({ show, handleClose, passenger, onSave, selectedPrinter }) => {
  const [formData, setFormData] = useState({ ...passenger });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');

  useEffect(() => {
    setFormData({ ...passenger });
  }, [passenger]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, shouldPrint = false) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch(`${API_URL}/api/passenger/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update passenger data');
      }

      setStatusMessage('Passenger data updated successfully!');
      setStatusType('success');
      onSave(formData);

      if (shouldPrint) {
        await printLabel();
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
      setStatusType('danger');
    } finally {
      setIsLoading(false);
    }
  };

  const printLabel = async () => {
    if (!selectedPrinter) {
      setStatusMessage('No printer connected.');
      setStatusType('danger');
      return;
    }

    // Implement your label printing logic here
    // This is a placeholder for the actual printing logic
    console.log('Printing label for:', formData);
    setStatusMessage('Label printed successfully!');
    setStatusType('success');
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Passenger</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {statusMessage && (
          <Alert variant={statusType} className="mb-4">
            {statusMessage}
          </Alert>
        )}
        <Form onSubmit={(e) => handleSubmit(e, false)}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Flight Number</Form.Label>
            <Form.Control
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Departure Location</Form.Label>
            <Form.Control
              type="text"
              name="departureLocation"
              value={formData.departureLocation}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Arrival Location</Form.Label>
            <Form.Control
              type="text"
              name="arrivalLocation"
              value={formData.arrivalLocation}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>RFID Tag</Form.Label>
            <Form.Control
              type="text"
              name="rfidTag"
              value={formData.rfidTag}
              onChange={handleInputChange}
              maxLength="24"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={(e) => handleSubmit(e, false)} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="success" onClick={(e) => handleSubmit(e, true)} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Save and Print Label'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPassengerModal;

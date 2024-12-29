import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { API_URL } from '../constants';

function generateRandomNumber() {
  const prefix = '102030405060'; // The fixed prefix
  let randomPart = '';

  // Generate 12 random digits (24 digits total - 12 digits for the prefix)
  for (let i = 0; i < 12; i++) {
    randomPart += Math.floor(Math.random() * 10).toString();
  }

  return prefix + randomPart;
}


const NewLuggage = ({ selectedPrinter }) => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    flightNumber: '',
    departureLocation: '',
    arrivalLocation: '',
    rfidTag: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success'); // 'success' or 'danger'
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsLoading(true);

    try {
      const rfidTag = await fetchRFIDTag();
      if(!rfidTag || Object.keys(rfidTag).length < 1) {
        throw new Error("RFID write error from printer.")
      }
      const updatedFormData = { ...formData, rfidTag };

      const response = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage('Passenger data saved successfully!');
        setStatusType('success');
        setFormData({
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          flightNumber: '',
          departureLocation: '',
          arrivalLocation: '',
          rfidTag: ''
        });
      } else {
        throw new Error(result.message || 'Failed to save passenger data.');
      }
    } catch (error) {
      setStatusMessage(error.message);
      setStatusType('danger');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRFIDTag = () => {
    return new Promise((resolve, reject) => {
      if (!selectedPrinter) {
        reject(new Error('No printer connected.'));
        return;
      }

      const zplCommand =
        `^XA
^FO50,50
^A0N,40
^FD${formData.firstName} ${formData.lastName}
^FS
^FO50,100
^A0N,30
^FD${formData.departureLocation} - ${formData.arrivalLocation}
^FS
^RFW,H
^FD${generateRandomNumber()}
^FS
^FN3
^RFR,H
^FS
^HV3
^XZ
`
      selectedPrinter.sendThenReadAllAvailable(
        zplCommand.trim(),
        (response) => {
          console.log(response)
          const startIndex = response.indexOf('3000') + 4;
          const tagId = response.substring(startIndex).trim();
          resolve(response);
        },
        (error) => reject(new Error('Error reading RFID tag: ' + error))
      );
    });
  };

  return (
    <div className="new-luggage-container">
      <h2 className="mb-4">Register New Passenger</h2>

      {/* Alert for status messages */}
      {statusMessage && (
        <Alert variant={statusType} className="mb-4">
          {statusMessage}
        </Alert>
      )}

      <Form onSubmit={handleFormSubmit} className="new-luggage-form">
        <Form.Control type="hidden" name="id" value={formData.id} />

        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            placeholder="Enter first name"
            required
            onChange={handleInputChange}
            value={formData.firstName}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            placeholder="Enter last name"
            required
            onChange={handleInputChange}
            value={formData.lastName}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email address"
            required
            onChange={handleInputChange}
            value={formData.email}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Flight Number</Form.Label>
          <Form.Control
            type="text"
            name="flightNumber"
            placeholder="Enter flight number"
            required
            onChange={handleInputChange}
            value={formData.flightNumber}
          />
        </Form.Group>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Departure Location</Form.Label>
              <Form.Control
                type="text"
                name="departureLocation"
                placeholder="Enter departure location"
                required
                onChange={handleInputChange}
                value={formData.departureLocation}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Arrival Location</Form.Label>
              <Form.Control
                type="text"
                name="arrivalLocation"
                placeholder="Enter arrival location"
                required
                onChange={handleInputChange}
                value={formData.arrivalLocation}
              />
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>RFID Tag</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              name="rfidTag"
              placeholder="Scan or enter RFID tag"
              maxLength="24"
              onChange={handleInputChange}
              value={formData.rfidTag}
              disabled={isLoading}
            />
          </div>
        </Form.Group>

        {/* Submit button with loading spinner */}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              Saving...{' '}
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
            </>
          ) : (
            'Print Label'
          )}
        </Button>
      </Form>
    </div>
  );
};

export default NewLuggage;

import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup, Table } from 'react-bootstrap';
import { debounce } from 'lodash';
import { API_URL } from '../../constants';

const TrackLuggageModal = ({ show, handleClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  const handleSearch = debounce(async (term) => {
    if (term.length < 2) return;
    // Replace this with your actual API call
    const results = await fetch(`${API_URL}/api/search-passengers?term=${term}`).then(res => res.json());
    setSearchResults(results);
  }, 300);

  const handleSelectPassenger = (passenger) => {
    setSelectedPassenger(passenger);
    setSearchTerm('');
    setSearchResults([]);
  };

  const renderScanLogs = () => {
    if (!selectedPassenger || !selectedPassenger.scanLogs || selectedPassenger.scanLogs.length === 0) {
      return <p>No scan logs available.</p>;
    }

    const sortedLogs = [...selectedPassenger.scanLogs].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return (
      <ListGroup variant="flush">
        {sortedLogs.map((log, index) => (
          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
            <span>{log.location}</span>
            <small className="text-muted">{new Date(log.timestamp).toLocaleString()}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Track Luggage</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search by name, email, or RFID tag"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </Form.Group>
        {searchResults.length > 0 && (
          <ListGroup className="mt-2">
            {searchResults.map((passenger) => (
              <ListGroup.Item
                key={passenger.id}
                action
                onClick={() => handleSelectPassenger(passenger)}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <span className="font-weight-bold text-primary">{`${passenger.firstName} ${passenger.lastName}`}</span>
                  <br />
                  <small className="text-muted">{passenger.email}</small>
                </div>
                <small className="text-success">{passenger.flightNumber}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        {selectedPassenger && (
          <>
            <h5 className="mt-4">Passenger Information</h5>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{`${selectedPassenger.firstName} ${selectedPassenger.lastName}`}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{selectedPassenger.email}</td>
                </tr>
                <tr>
                  <th>Flight Number</th>
                  <td>{selectedPassenger.flightNumber}</td>
                </tr>
                <tr>
                  <th>From</th>
                  <td>{selectedPassenger.departureLocation}</td>
                </tr>
                <tr>
                  <th>To</th>
                  <td>{selectedPassenger.arrivalLocation}</td>
                </tr>
                <tr>
                  <th>RFID Tag</th>
                  <td>{selectedPassenger.rfidTag}</td>
                </tr>
              </tbody>
            </Table>
            <h5 className="mt-4">Scan Logs</h5>
            {renderScanLogs()}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TrackLuggageModal;

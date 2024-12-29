import React from 'react';
import { Modal, Button, Table, ListGroup } from 'react-bootstrap';

const RfidScanModal = ({ show, handleClose, scanData }) => {
  const { tagID, isTagAssigned, foundPassenger } = scanData || {};

  const renderScanLogs = () => {
    if (!foundPassenger || !foundPassenger.scanLogs || foundPassenger.scanLogs.length === 0) {
      return <p>No scan logs available.</p>;
    }

    const sortedLogs = [...foundPassenger.scanLogs].sort((a, b) => 
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
        <Modal.Title>RFID Scan Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <tbody>
            <tr>
              <th>Tag ID</th>
              <td>{tagID}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{isTagAssigned ? 'Assigned' : 'Unassigned'}</td>
            </tr>
          </tbody>
        </Table>
        {isTagAssigned && foundPassenger && (
          <>
            <h5 className="mt-4">Passenger Information</h5>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{`${foundPassenger.firstName} ${foundPassenger.lastName}`}</td>
                </tr>
                <tr>
                  <th>Flight Number</th>
                  <td>{foundPassenger.flightNumber}</td>
                </tr>
                <tr>
                  <th>From</th>
                  <td>{foundPassenger.departureLocation}</td>
                </tr>
                <tr>
                  <th>To</th>
                  <td>{foundPassenger.arrivalLocation}</td>
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

export default RfidScanModal;

import React, { useState } from 'react';
import { Navbar, Container, Badge } from 'react-bootstrap';
import { FaPlane, FaPrint } from 'react-icons/fa';
import DeviceStatusModal from '../modal/DeviceStatusModal';

const Topbar = ({ selectedPrinter }) => {
  const [showModal, setShowModal] = useState(false);
  const isPrinterConnected = selectedPrinter;

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="topbar">
        <Container fluid>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            <FaPlane className="me-2" />
            <span className="fs-4 fw-bold">Airport Luggage Tracking</span>
          </Navbar.Brand>
          <Navbar.Text 
            className="ms-auto d-flex align-items-center cursor-pointer"
            onClick={handleShowModal}
          >
            <FaPrint className="me-2" />
            <Badge bg={isPrinterConnected ? 'success' : 'danger'} className="printer-status">
              {isPrinterConnected ? `Connected: ${selectedPrinter.name}` : "No printer connected"}
            </Badge>
          </Navbar.Text>
        </Container>
      </Navbar>

      <DeviceStatusModal
        show={showModal} 
        handleClose={handleCloseModal} 
        selectedPrinter={selectedPrinter}
      />
    </>
  );
};

export default Topbar;

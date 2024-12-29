import React, { useState } from 'react';
import { Button, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaList, FaSearch } from 'react-icons/fa';
import TrackLuggageModal from '../modal/TrackLuggageModal';

const Sidebar = () => {
  const location = useLocation();
  const [showTrackModal, setShowTrackModal] = useState(false);

  return (
    <>
      <Nav className="flex-column sidebar">
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/new-luggage"
            className={location.pathname === '/new-luggage' ? 'active' : ''}
          >
            <FaPlus className="icon" />
            <span>New Luggage</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/all-luggages"
            className={location.pathname === '/all-luggages' ? 'active' : ''}
          >
            <FaList className="icon" />
            <span>All Luggages</span>
          </Nav.Link>
        </Nav.Item>
        <div className="mt-auto">
          <Button
            variant="primary"
            size="lg"
            block
            className="track-luggage-btn mb-5"
            onClick={() => setShowTrackModal(true)}
          >
            <FaSearch className="icon" />
            Track Luggage
          </Button>
        </div>
      </Nav>
      <TrackLuggageModal show={showTrackModal} handleClose={() => setShowTrackModal(false)} />
    </>
  );
};

export default Sidebar;

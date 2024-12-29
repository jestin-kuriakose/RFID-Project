import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import NewLuggage from './pages/NewLuggage';
import AllLuggages from './pages/AllLuggages';
import './styles/custom.scss';
import { WebSocketContext } from './context/WebSocketContext';
import RfidScanModal from './components/modal/RfidScanModal';

function App() {
  const [printerStatus, setPrinterStatus] = useState('Checking printer...');
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [scannedLiveRfid, setScannedLiveRfid] = useState(null)
  const [showScanModal, setShowScanModal] = useState(false);

  const {lastMessage} = useContext(WebSocketContext);

  useEffect(() => {
    if (window.BrowserPrint) {
      window.BrowserPrint.getDefaultDevice("printer", 
        (device) => {
          setSelectedPrinter(device);
          setPrinterStatus(`Connected: ${device.name}`);
        },
        (error) => {
          console.error(error);
          setSelectedPrinter(null)
          setPrinterStatus("No printer connected");
        }
      );
    }
  }, []);

  useEffect(() => {
    if(lastMessage?.type === "rfid-scan") {
        setScannedLiveRfid(lastMessage)
        setShowScanModal(true)
    }
  }, [lastMessage])

  const handleCloseScanModal = () => setShowScanModal(false);

  return (
    <Router>
      <div className="App d-flex flex-column vh-100">
        <Topbar selectedPrinter={selectedPrinter} />
        <Container fluid className="flex-grow-1">
          <Row className="h-100">
            <Col md={3} lg={2} className="sidebar-wrapper p-0">
              <Sidebar />
            </Col>
            <Col md={9} lg={10} className="main-content p-4">
              <Routes>
                <Route path="/new-luggage" element={<NewLuggage selectedPrinter={selectedPrinter} />} />
                <Route path="/all-luggages" element={<AllLuggages selectedPrinter={selectedPrinter}/>} />
                <Route path="/" element={<NewLuggage selectedPrinter={selectedPrinter} />} />
              </Routes>
            </Col>
          </Row>
        </Container>
        <RfidScanModal
          show={showScanModal} 
          handleClose={handleCloseScanModal} 
          scanData={scannedLiveRfid}
        />
      </div>
    </Router>
  );
}

export default App;

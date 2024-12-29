import React, { useState, useEffect, useContext } from 'react';
import { Modal, Tab, Tabs, Table, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { FaPrint, FaMobileAlt, FaServer, FaSave } from 'react-icons/fa';
import { API_URL } from '../../constants';
import { WebSocketContext } from '../../context/WebSocketContext';

const DeviceStatusModal = ({ show, handleClose, selectedPrinter }) => {
    const { lastMessage } = useContext(WebSocketContext);

    const [serverStatus, setServerStatus] = useState(null);
    const [rfidReaderData, setRfidReaderData] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [apiUrl, setApiUrl] = useState(localStorage.getItem("RFID_API_URL") || "192.168.1.134");

    useEffect(() => {
        const checkRfidReaderStatus = () => {
            setRfidReaderData(lastMessage);
        };

        if (lastMessage?.type === "status") {
            checkRfidReaderStatus();
        }
        const interval = setInterval(checkRfidReaderStatus, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [lastMessage]);



    const isRfidReaderConnected = () => {
        if (!rfidReaderData) return false;
        const lastTimestamp = new Date(rfidReaderData?.timestamp);
        const currentTime = new Date();
        if ((currentTime - lastTimestamp) / 1000 <= 6) {
            return rfidReaderData?.rfidReaderStatus
        } else {
            return "Disconnected"
        }
    };

    const handleLocationChange = async (e) => {
        const newLocation = e.target.value;
        setSelectedLocation(newLocation);

        try {
            const response = await fetch(`${API_URL}/api/update-rfid-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ location: newLocation }),
            });

            if (!response.ok) {
                throw new Error('Failed to update location');
            }

            // Optionally, you can update the local state here if needed
            setRfidReaderData(prevData => ({ ...prevData, location: newLocation }));
        } catch (error) {
            console.error('Error updating RFID reader location:', error);
            // Optionally, show an error message to the user
        }
    };

    useEffect(() => {
        const checkRfidReaderStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/rfid-reader-status`);
                const data = await response.json();
                setRfidReaderData(data);
                setSelectedLocation(data.location || '');
            } catch (error) {
                console.error('Error fetching RFID reader status:', error);
            }
        };

        const checkServerStatus = () => {
            fetch(`${API_URL}/api/status`)
                .then(response => response.json())
                .then(data => setServerStatus(data))
                .catch(error => setServerStatus(null));
        };
        checkServerStatus();
        checkRfidReaderStatus()
    }, []);

    const renderStatusBadge = (status) => {
        return (
            <Badge bg={status ? 'success' : 'danger'}>
                {status ? 'Connected' : 'Disconnected'}
            </Badge>
        );
    };

    const handleApiUrlChange = (e) => {
        setApiUrl(e.target.value);
    };

    const saveApiUrl = () => {
        localStorage.setItem("RFID_API_URL", apiUrl);
        window.location.reload()
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Device Status</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="printer" id="device-status-tabs" className="mb-3">
                    <Tab eventKey="printer" title={<><FaPrint /> Zebra Printer</>}>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td>Status</td>
                                    <td>{renderStatusBadge(selectedPrinter)}</td>
                                </tr>
                                <tr>
                                    <td>Model</td>
                                    <td>ZD621</td>
                                </tr>
                                <tr>
                                    <td>UID</td>
                                    <td>{selectedPrinter?.uid}</td>
                                </tr>
                                <tr>
                                    <td>Connection</td>
                                    <td>{selectedPrinter?.connection}</td>
                                </tr>
                                <tr>
                                    <td>Device Type</td>
                                    <td>{selectedPrinter?.deviceType}</td>
                                </tr>
                                <tr>
                                    <td>Manufacturer</td>
                                    <td>{selectedPrinter?.manufacturer}</td>
                                </tr>
                                <tr>
                                    <td>Version</td>
                                    <td>{selectedPrinter?.version}</td>
                                </tr>

                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="rfidReader" title={<><FaMobileAlt /> RFID Reader</>}>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td>Status</td>
                                    <td>{renderStatusBadge(isRfidReaderConnected() === 'Connected' ? true : false)}</td>
                                </tr>
                                <tr>
                                    <td>Device Name</td>
                                    <td>{rfidReaderData?.deviceName || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Reader ID</td>
                                    <td>{rfidReaderData?.rfidInfo?.length > 0 ? rfidReaderData?.rfidInfo[0] : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Reader Name</td>
                                    <td>{rfidReaderData?.rfidInfo?.length > 0 ? rfidReaderData?.rfidInfo[1] : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>MAC Address</td>
                                    <td>{rfidReaderData?.rfidInfo?.length > 0 ? rfidReaderData?.rfidInfo[2] : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Additional Info</td>
                                    <td>{rfidReaderData?.additionalInfo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Last Updated</td>
                                    <td>{rfidReaderData ? new Date(rfidReaderData.timestamp).toLocaleString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Location</td>
                                    <td>
                                        <Form.Select value={selectedLocation} onChange={handleLocationChange}>
                                            <option value="">Select Location</option>
                                            <option value="loading_bay">Loading Bay</option>
                                            <option value="security_checkpoint">Security Checkpoint</option>
                                            <option value="baggage_claim">Baggage Claim</option>
                                            <option value="departure_gate">Departure Gate</option>
                                        </Form.Select>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Tab>

                    <Tab eventKey="server" title={<><FaServer /> Backend Server</>}>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td>Status</td>
                                    <td>{renderStatusBadge(serverStatus)}</td>
                                </tr>
                                <tr>
                                    <td>IP Address</td>
                                    <td>{serverStatus?.ipAddress}</td>
                                </tr>
                                <tr>
                                    <td>Port</td>
                                    <td>{serverStatus?.port}</td>
                                </tr>
                                <tr>
                                    <td>UP Time</td>
                                    <td>{serverStatus?.uptime} sec</td>
                                </tr>
                                <tr>
                                    <td>Last Checked</td>
                                    <td>{new Date(serverStatus?.timestamp).toLocaleTimeString('en-US')}</td>
                                </tr>
                                <tr>
                                    <td>API URL</td>
                                    <td>
                                        <InputGroup className="mb-3">
                                            <Form.Control
                                                type="text"
                                                value={apiUrl}
                                                onChange={handleApiUrlChange}
                                                placeholder="Enter API URL"
                                                aria-label="API URL"
                                                aria-describedby="basic-addon2"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                id="button-addon2"
                                                onClick={saveApiUrl}
                                            >
                                                <FaSave /> Save
                                            </Button>
                                        </InputGroup>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

export default DeviceStatusModal;

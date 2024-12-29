const express = require("express");
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { WebSocketServer, WebSocket } = require("ws");
const http = require("http");
const os = require("os");

const app = express();
const port = process.env.PORT || 3001;

const passengerDataPath = path.join(__dirname, "db", "passengerData.json");
const rfidReaderDataPath = path.join(__dirname, "db", "rfidReaderData.json")

app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, "public", "dist")));
app.use("/js", express.static(path.join(__dirname, "js")));
console.log(path.join(__dirname, "public", "dist"))
// Create an HTTP server and integrate it with Express
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocketServer({ port: 8091 });


wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  ws.on("message", (message) => {
    console.log("Received message from WS:", JSON.parse(message));
    const parsedMessage = JSON.parse(message)
    broadcastToWebSocketClients(parsedMessage)
  });

  // Send a welcome message to confirm the connection
  ws.send(JSON.stringify({ type: "connection", message: "WebSocket connected" }));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

function broadcastToWebSocketClients(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  });
}

// Endpoint to get RFID reader status
app.get('/api/rfid-reader-status', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(rfidReaderDataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('Error reading RFID reader data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update RFID reader location
app.post('/api/update-rfid-location', (req, res) => {
  const { location } = req.body;

  try {
    const data = JSON.parse(fs.readFileSync(rfidReaderDataPath, 'utf8'));
    data.location = location;
    fs.writeFileSync(rfidReaderDataPath, JSON.stringify(data, null, 2));
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating RFID reader location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search-passengers', (req, res) => {
  const { term } = req.query;

  if (!term || term.length < 2) {
    return res.status(400).json({ error: 'Search term must be at least 2 characters long' });
  }

  const existingData = JSON.parse(fs.readFileSync(passengerDataPath, "utf8"));

  const results = existingData.filter(passenger =>
    passenger.firstName.toLowerCase().includes(term.toLowerCase()) ||
    passenger.lastName.toLowerCase().includes(term.toLowerCase()) ||
    passenger.email.toLowerCase().includes(term.toLowerCase()) ||
    passenger.rfidTag.toLowerCase().includes(term.toLowerCase())
  );

  res.json(results.slice(0, 10)); // Limit to 10 results
});


app.post("/api/save", (req, res) => {
  const data = req.body;
  const id = data.id === "" ? uuidv4() : data.id;
  const passengerData = { ...data, id, scanLogs: [] };
  console.log(id)
  let existingData = [];
  if (fs.existsSync(passengerDataPath)) {
    existingData = JSON.parse(fs.readFileSync(passengerDataPath, "utf8"));
  }

  const index = existingData.findIndex((p) => p.id === id);
  if (index !== -1) {
    existingData[index] = passengerData;
  } else {
    existingData.push(passengerData);
  }

  fs.writeFileSync(passengerDataPath, JSON.stringify(existingData, null, 2));

  res.json({ message: "Data saved successfully", id });
});

app.put("/api/passenger/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!fs.existsSync(passengerDataPath)) {
    return res.status(404).json({ message: "No passenger data found" });
  }

  let existingData = JSON.parse(fs.readFileSync(passengerDataPath, "utf8"));
  const index = existingData.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Passenger not found" });
  }

  // Update the passenger data
  existingData[index] = { ...existingData[index], ...updatedData, id };

  // Write the updated data back to the file
  fs.writeFileSync(passengerDataPath, JSON.stringify(existingData, null, 2));

  res.json({ message: "Passenger updated successfully", passenger: existingData[index] });
});


app.get('/api/passengers', (req, res) => {
  const { rfidTag } = req.query;
  if (!fs.existsSync(passengerDataPath)) {
    return res.json([]);
  }

  const existingData = JSON.parse(fs.readFileSync(passengerDataPath, "utf8"));

  if (rfidTag) {
    const filteredData = existingData.filter(passenger => passenger.rfidTag === rfidTag);
    res.json(filteredData);
  } else {
    res.json(existingData);
  }
});


app.get("/api/passenger/:id", (req, res) => {
  const { id } = req.params;

  if (!fs.existsSync(passengerDataPath)) {
    return res.status(404).json({ message: "No passenger data found" });
  }

  const existingData = JSON.parse(
    fs.readFileSync(passengerDataPath, "utf8")
  );
  const passenger = existingData.find((p) => p.id === id);

  if (!passenger) {
    return res.status(404).json({ message: "Passenger not found" });
  }

  res.json(passenger);
});

app.delete("/api/passenger/:id", (req, res) => {
  const { id } = req.params;

  if (!fs.existsSync(passengerDataPath)) {
    return res.status(404).json({ message: "No passenger data found" });
  }

  let existingData = JSON.parse(fs.readFileSync(passengerDataPath, "utf8"));
  existingData = existingData.filter((p) => p.id !== id);

  fs.writeFileSync(passengerDataPath, JSON.stringify(existingData, null, 2));

  res.json({ message: "Passenger deleted successfully" });
});

app.post("/scanned-rfid", (req, res) => {
  console.log(req.body);
  const { tagID } = req.body;
  console.log(`Tag ID: ${tagID}`);

  // if(!tagID.startsWith("E280")) return

  const existingData = JSON.parse(
    fs.readFileSync(passengerDataPath, "utf8")
  );
  const foundPassenger = existingData.find(pass => pass.rfidTag === tagID)

  const currentRfidReader = JSON.parse(fs.readFileSync(rfidReaderDataPath, 'utf8'));


  if (foundPassenger) {
    broadcastToWebSocketClients({ tagID, isTagAssigned: true, foundPassenger, type: "rfid-scan" });
    // Update scanLogs array
    const scanLog = { location: currentRfidReader?.location, timestamp: new Date().toISOString() };
    foundPassenger.scanLogs = foundPassenger.scanLogs || [];
    foundPassenger.scanLogs.push(scanLog);

    // Write updated data back to file
    fs.writeFileSync(passengerDataPath, JSON.stringify(existingData, null, 2));

    res.json({ passengerFound: true, foundPassenger });

  } else {
    broadcastToWebSocketClients({ tagID, isTagAssigned: false, foundPassenger: null, type: "rfid-scan" });
    res.json({ passengerFound: false, foundPassenger: null });

  }

});

app.get("/passenger-info", (req, res) => {
  console.log(req.query);
  const { tagId } = req.query;

  broadcastToWebSocketClients({ tagId })

  if (!fs.existsSync(passengerDataPath)) {
    return res.status(404).json({ message: "No passenger data found" });
  }

  const existingData = JSON.parse(
    fs.readFileSync(passengerDataPath, "utf8")
  );
  const passenger = existingData.find((p) => p.rfidTag === tagId);

  if (!passenger) {
    return res.status(404).json({ message: "Passenger not found" });
  }

  res.json({ passenger });
});

app.get('/api/status', (req, res) => {
  const ipAddress = Object.values(os.networkInterfaces())
    .flat()
    .find(interface => !interface.internal && interface.family === 'IPv4')
    .address;

  const statusData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 3001,
    ipAddress: ipAddress
  };

  res.status(200).json(statusData);
});

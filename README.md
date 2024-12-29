# Methodology: Development of the Airport Luggage Tracking System

The **Airport Luggage Tracking System** is a user-friendly web application designed to streamline the process of assigning and tracking RFID tags for passenger luggage. This innovative project utilizes modern technologies and devices, including the **Zebra RFID printer ZD621**, **Zebra Android device TC52**, and the attachable **Zebra RFID reader RFD40**. The system is structured to work seamlessly with a React-based frontend, a Node.js backend, and various integrated components. Below is a detailed explanation of the methodology employed in developing this application.

## Overview of the System

The web application consists of two main parts:

### 1. Frontend Application
- Built with **React** and styled using **Bootstrap**, the frontend allows users to interact with the system. 
- It includes forms for entering passenger details, displays data in organized tables, and manages modals for viewing passenger information.

### 2. Backend Server
- The backend is created using **Node.js** and processes/stores passenger data in a local **JSON** file.
- It handles API calls and **WebSocket** connections to facilitate communication between devices and the frontend.

## Core Technologies and Devices Used

### 1. **React Framework**
- The frontend is built using **React**, a popular JavaScript library for building interactive user interfaces. React was chosen for its efficiency in handling dynamic data and creating a seamless user experience.

### 2. **Node.js**
- **Node.js** powers the backend server, chosen for its ability to handle asynchronous operations, ensuring quick and responsive communication between the frontend and devices.

### 3. **Bootstrap**
- The **Bootstrap** CSS framework is used to style the web application, ensuring a clean, professional appearance that adapts to different screen sizes.

### 4. **JSON**
- **JSON** is used to store passenger information and RFID tag assignments. Its lightweight structure is easy to read and serves as an effective alternative to a database for this project's scope.

### 5. **Zebra Devices**
   - **ZD621 RFID Printer**: This printer generates RFID tags with unique IDs and prints labels containing passenger and flight details using **ZPL (Zebra Programming Language)**, which encodes RFID data.
   - **TC52 Android Device with RFD40 RFID Reader**: The TC52 device is equipped with the RFD40 Bluetooth RFID reader, which scans luggage tags. The portable, ergonomic design ensures easy handling and accurate scanning.
   - **Enterprise Browser**: The web app running on the TC52 device is deployed in **Zebra’s Enterprise Browser**, designed for Zebra devices to allow seamless access to hardware features like the RFID reader.

## Features and Workflow

### 1. **Assigning an RFID Tag to Luggage**
   - A user enters passenger details (first name, last name, email, airport information, flight number) into the frontend form.
   - Upon submission, the backend sends a **ZPL command** to the **ZD621** printer. This command includes a randomly generated RFID tag ID and label formatting instructions.
   - The printer encodes the RFID tag and prints the label with passenger details, which is then returned to the application.
   - The backend stores this information in the **JSON** file, associating the RFID tag with the passenger.

### 2. **Viewing and Managing Passenger Data**
   - A table on the frontend displays passengers with assigned RFID tags. Users can edit or delete entries as needed.
   - A search feature allows users to find passengers by name, email, or RFID tag ID. Selecting a passenger shows their details and scan history in a professional layout.

### 3. **Scanning RFID Tags**
   - The **TC52 device with the RFD40 reader** scans luggage tags. The scanned tag’s ID is sent to the backend via an API call.
   - The backend checks the **JSON** file to verify if the tag is assigned and returns the relevant passenger data.
   - This information is displayed both on the TC52 app and the React frontend, with a modal showing passenger details and scan logs.

### 4. **Device Status Monitoring and Configuration**
   - A status page tracks the connectivity of the RFID reader, printer, and backend server, providing real-time updates via **WebSocket** connections.
   - Users can modify the backend server’s IP address to ensure uninterrupted communication if the network changes.

## Benefits of the Chosen Technologies

### 1. **Enterprise Browser**
- Essential for accessing hardware features of the TC52 device, such as Bluetooth communication with the RFID reader. It ensures optimal app performance on Zebra devices.

### 2. **ZPL (Zebra Programming Language)**
- Allows precise control over the RFID printer, creating detailed labels with both printed text and encoded RFID data.

### 3. **API Calls**
- Facilitate communication between the frontend, backend, and devices. They are used to submit passenger data, retrieve scanned tag information, and update configurations.

### 4. **WebSocket Connections**
- Enable real-time status updates between the backend and frontend, ensuring that users are always informed about device connectivity.

### 5. **JSON Storage**
- Simplifies data management by eliminating the need for a complex database setup while still allowing structured storage and retrieval of passenger information.

## Conclusion

This project demonstrates a practical implementation of modern web technologies and specialized hardware to create an efficient luggage tracking system. By leveraging **Zebra devices**, **React**, **Node.js**, and other tools, the system achieves seamless interaction between components, providing a user-friendly and reliable solution for airport luggage tracking. The use of **Enterprise Browser**, **ZPL**, **API calls**, and **WebSockets** highlights the thoughtful integration of technologies to meet project goals while maintaining simplicity and functionality.

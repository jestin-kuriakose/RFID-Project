import React, { createContext, useState, useEffect, useCallback } from 'react';
import { WS_URL } from '../constants';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);


  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setSocket(ws);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      setLastMessage(message);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setSocket(null);
      setIsConnected(false);
      setTimeout(connect, 5000); // Attempt to reconnect after 5 seconds
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, []);

  useEffect(() => {
    const ws = connect();
    return () => {
      ws.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ socket, lastMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

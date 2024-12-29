const SERVERL_URL = localStorage.getItem("RFID_API_URL") || "192.168.1.134"
export const API_URL = `http://${SERVERL_URL}:3001`
export const WS_URL = `ws://${SERVERL_URL}:8091`
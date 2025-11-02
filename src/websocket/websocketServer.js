// const WebSocket = require('ws');
// const jwt = require('jsonwebtoken');

// class WebSocketServer {
//   constructor(server) {
//     this.wss = new WebSocket.Server({ server });
//     this.clients = new Map(); // Map to store client connections
//     this.rooms = new Map(); // Map to store room participants
    
//     this.init();
//   }

//   init() {
//     this.wss.on('connection', (ws, req) => {
//       console.log('New WebSocket connection established');
      
//       // Handle authentication
//       this.handleAuthentication(ws, req);
      
//       // Handle incoming messages
//       ws.on('message', (message) => {
//         try {
//           const data = JSON.parse(message);
//           this.handleMessage(ws, data);
//         } catch (error) {
//           console.error('Error parsing WebSocket message:', error);
//           this.sendError(ws, 'Invalid message format');
//         }
//       });

//       // Handle client disconnect
//       ws.on('close', () => {
//         this.handleDisconnect(ws);
//       });

//       // Handle errors
//       ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//         this.handleDisconnect(ws);
//       });
//     });
//   }

//   handleAuthentication(ws, req) {
//     // Extract token from query string or headers
//     const url = new URL(req.url, `http://${req.headers.host}`);
//     const token = url.searchParams.get('token') || req.headers.authorization?.split(' ')[1];

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         ws.userId = decoded.uid;
//         ws.isAuthenticated = true;
        
//         // Store client connection
//         this.clients.set(decoded.uid, ws);
        
//         console.log(`Authenticated user ${decoded.uid} connected`);
        
//         // Send welcome message
//         this.sendMessage(ws, {
//           type: 'connection',
//           status: 'authenticated',
//           message: 'Successfully connected to live preview server'
//         });
//       } catch (error) {
//         console.error('Authentication failed:', error);
//         ws.isAuthenticated = false;
//         this.sendError(ws, 'Authentication failed');
//       }
//     } else {
//       ws.isAuthenticated = false;
//       this.sendMessage(ws, {
//         type: 'connection',
//         status: 'unauthenticated',
//         message: 'Connected as guest'
//       });
//     }
//   }

//   handleMessage(ws, data) {
//     switch (data.type) {
//       case 'join_room':
//         this.handleJoinRoom(ws, data);
//         break;
      
//       case 'leave_room':
//         this.handleLeaveRoom(ws, data);
//         break;
      
//       case 'live_preview':
//         this.handleLivePreview(ws, data);
//         break;
      
//       case 'product_update':
//         this.handleProductUpdate(ws, data);
//         break;
      
//       case 'cart_update':
//         this.handleCartUpdate(ws, data);
//         break;
      
//       case 'chat_message':
//         this.handleChatMessage(ws, data);
//         break;
      
//       case 'typing_indicator':
//         this.handleTypingIndicator(ws, data);
//         break;
      
//       case 'order_status_update':
//         this.handleOrderStatusUpdate(ws, data);
//         break;
      
//       default:
//         this.sendError(ws, 'Unknown message type');
//     }
//   }

//   handleJoinRoom(ws, data) {
//     const { roomId } = data;
    
//     if (!ws.rooms) {
//       ws.rooms = new Set();
//     }
    
//     ws.rooms.add(roomId);
    
//     if (!this.rooms.has(roomId)) {
//       this.rooms.set(roomId, new Set());
//     }
    
//     this.rooms.get(roomId).add(ws);
    
//     // Notify other clients in the room
//     this.broadcastToRoom(roomId, {
//       type: 'user_joined',
//       roomId,
//       userId: ws.userId || 'guest',
//       timestamp: new Date().toISOString()
//     }, ws);
    
//     console.log(`User joined room: ${roomId}`);
//   }

//   handleLeaveRoom(ws, data) {
//     const { roomId } = data;
    
//     if (ws.rooms && ws.rooms.has(roomId)) {
//       ws.rooms.delete(roomId);
      
//       if (this.rooms.has(roomId)) {
//         this.rooms.get(roomId).delete(ws);
        
//         // Clean up empty rooms
//         if (this.rooms.get(roomId).size === 0) {
//           this.rooms.delete(roomId);
//         }
//       }
      
//       // Notify other clients in the room
//       this.broadcastToRoom(roomId, {
//         type: 'user_left',
//         roomId,
//         userId: ws.userId || 'guest',
//         timestamp: new Date().toISOString()
//       }, ws);
      
//       console.log(`User left room: ${roomId}`);
//     }
//   }

//   handleLivePreview(ws, data) {
//     const { roomId, previewData } = data;
    
//     // Broadcast live preview to all clients in the room
//     this.broadcastToRoom(roomId, {
//       type: 'live_preview_update',
//       roomId,
//       previewData,
//       userId: ws.userId || 'guest',
//       timestamp: new Date().toISOString()
//     }, ws);
//   }

//   handleProductUpdate(ws, data) {
//     const { productId, updateData } = data;
    
//     // Broadcast product updates to all connected clients
//     this.broadcastToAll({
//       type: 'product_update',
//       productId,
//       updateData,
//       timestamp: new Date().toISOString()
//     });
//   }

//   handleCartUpdate(ws, data) {
//     const { userId, cartData } = data;
    
//     // Send cart update to specific user
//     if (this.clients.has(userId)) {
//       this.sendMessage(this.clients.get(userId), {
//         type: 'cart_update',
//         cartData,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   handleChatMessage(ws, data) {
//     const { roomId, message, sender } = data;
    
//     // Broadcast chat message to all clients in the room
//     this.broadcastToRoom(roomId, {
//       type: 'chat_message',
//       roomId,
//       message,
//       sender: sender || ws.userId || 'guest',
//       timestamp: new Date().toISOString()
//     });
//   }

//   handleTypingIndicator(ws, data) {
//     const { roomId, isTyping, userId } = data;
    
//     // Broadcast typing indicator to other clients in the room
//     this.broadcastToRoom(roomId, {
//       type: 'typing_indicator',
//       roomId,
//       isTyping,
//       userId: userId || ws.userId || 'guest',
//       timestamp: new Date().toISOString()
//     }, ws);
//   }

//   handleOrderStatusUpdate(ws, data) {
//     const { userId, orderId, status, orderData } = data;
    
//     // Send order status update to specific user
//     if (this.clients.has(userId)) {
//       this.sendMessage(this.clients.get(userId), {
//         type: 'order_status_update',
//         orderId,
//         status,
//         orderData,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   broadcastToRoom(roomId, message, excludeWs = null) {
//     if (this.rooms.has(roomId)) {
//       this.rooms.get(roomId).forEach(client => {
//         if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
//           this.sendMessage(client, message);
//         }
//       });
//     }
//   }

//   broadcastToAll(message) {
//     this.wss.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) {
//         this.sendMessage(client, message);
//       }
//     });
//   }

//   sendMessage(ws, message) {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.send(JSON.stringify(message));
//     }
//   }

//   sendError(ws, error) {
//     this.sendMessage(ws, {
//       type: 'error',
//       message: error,
//       timestamp: new Date().toISOString()
//     });
//   }

//   handleDisconnect(ws) {
//     // Remove from all rooms
//     if (ws.rooms) {
//       ws.rooms.forEach(roomId => {
//         if (this.rooms.has(roomId)) {
//           this.rooms.get(roomId).delete(ws);
          
//           // Clean up empty rooms
//           if (this.rooms.get(roomId).size === 0) {
//             this.rooms.delete(roomId);
//           }
//         }
//       });
//     }
    
//     // Remove from clients map
//     if (ws.userId && this.clients.has(ws.userId)) {
//       this.clients.delete(ws.userId);
//     }
    
//     console.log('Client disconnected');
//   }

//   // Method to send notifications to specific users
//   sendNotification(userId, notification) {
//     if (this.clients.has(userId)) {
//       const ws = this.clients.get(userId);
//       this.sendMessage(ws, {
//         type: 'notification',
//         ...notification,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   // Method to broadcast system announcements
//   broadcastAnnouncement(announcement) {
//     this.broadcastToAll({
//       type: 'announcement',
//       ...announcement,
//       timestamp: new Date().toISOString()
//     });
//   }
// }

// module.exports = WebSocketServer;

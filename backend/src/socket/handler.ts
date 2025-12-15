import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwtService from '../services/jwt.js';

interface AuthSocket extends Socket {
  user?: {
    id: string;
    role?: string;
    phoneNumber?: string;
  };
}

export const initializeSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'https://admin.pickpoint.my.id', 'https://paket.pickpoint.my.id'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  /**
   * Middleware: Verify JWT token
   */
  io.use((socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: token missing'));
      }

      const payload = jwtService.verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Authentication error: invalid token'));
      }

      socket.user = {
        id: payload.id,
        role: payload.role,
        phoneNumber: payload.phoneNumber,
      };

      next();
    } catch (err: any) {
      next(new Error('Authentication error: ' + err.message));
    }
  });

  /**
   * Staff namespace: /staff
   * For staff and admin users only
   */
  const staffNamespace = io.of('/staff');

  staffNamespace.on('connection', (socket: AuthSocket) => {
    console.log('[Socket] Staff connected:', socket.user?.id);

    // Join location room
    if (socket.user) {
      socket.join(`staff_${socket.user.id}`);
      console.log('[Socket] Staff joined room:', `staff_${socket.user.id}`);
    }

    /**
     * QR_SCANNED: Emit when staff scans QR code
     * Broadcast to all connected clients for this user
     */
    socket.on('QR_SCANNED', (data) => {
      console.log('[Socket] QR_SCANNED from', socket.user?.id, data);
      // Broadcast to all staff in same location
      staffNamespace.emit('QR_SCANNED', {
        trackingNumber: data.trackingNumber,
        userId: socket.user?.id,
        timestamp: Date.now(),
      });
    });

    /**
     * PACKAGE_ADDED: Emit when package is added
     */
    socket.on('PACKAGE_ADDED', (data) => {
      console.log('[Socket] PACKAGE_ADDED', data);
      staffNamespace.emit('PACKAGE_ADDED', {
        ...data,
        timestamp: Date.now(),
      });
    });

    /**
     * PACKAGE_PICKED: Emit when package is picked
     */
    socket.on('PACKAGE_PICKED', (data) => {
      console.log('[Socket] PACKAGE_PICKED', data);
      staffNamespace.emit('PACKAGE_PICKED', {
        ...data,
        timestamp: Date.now(),
      });
    });

    /**
     * REQUEST_RELOAD: Request other clients to reload data
     */
    socket.on('REQUEST_RELOAD', (data) => {
      console.log('[Socket] REQUEST_RELOAD', data);
      staffNamespace.emit('RELOAD_DATA', {
        ...data,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Staff disconnected:', socket.user?.id);
    });
  });

  /**
   * Customer namespace: /customer
   * For customer users only
   */
  const customerNamespace = io.of('/customer');

  customerNamespace.on('connection', (socket: AuthSocket) => {
    console.log('[Socket] Customer connected:', socket.user?.phoneNumber);

    // Join customer-specific room
    if (socket.user) {
      socket.join(`customer_${socket.user.id}`);
      console.log('[Socket] Customer joined room:', `customer_${socket.user.id}`);
    }

    /**
     * PACKAGE_STATUS_UPDATED: Notify customer of package status change
     * (Backend sends this to customer after package update)
     */
    socket.on('GET_PACKAGE_STATUS', (packageId) => {
      // Frontend queries backend API for latest status
      console.log('[Socket] Customer requesting status for:', packageId);
      socket.emit('REQUEST_ACKNOWLEDGED', { packageId });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Customer disconnected:', socket.user?.phoneNumber);
    });
  });

  return io;
};

/**
 * Helper function: Emit package status update to specific customer
 * Call from backend when package status changes
 */
export const notifyPackageUpdate = (io: SocketIOServer, customerId: string, packageData: any) => {
  io.of('/customer').to(`customer_${customerId}`).emit('PACKAGE_STATUS_UPDATED', {
    packageId: packageData.id,
    status: packageData.status,
    timestamp: Date.now(),
  });
};

/**
 * Helper function: Broadcast to all staff
 */
export const broadcastToStaff = (io: SocketIOServer, event: string, data: any) => {
  io.of('/staff').emit(event, {
    ...data,
    timestamp: Date.now(),
  });
};

export default initializeSocket;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
// Global variable to generate unique room IDs
let GLOBAL_ROOM_ID = 1;
// RoomManager class handles creating rooms and relaying WebRTC messages
class RoomManager {
    constructor() {
        // Initialize the rooms map
        this.rooms = new Map();
    }
    // Create a new room for two users
    createRoom(user1, user2) {
        // Generate a unique room ID
        const roomId = this.generate().toString();
        // Store the room in the map
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        });
        // Notify both users to start the offer process
        user1.socket.emit("send-offer", {
            roomId
        });
        user2.socket.emit("send-offer", {
            roomId
        });
    }
    // Handle receiving an offer SDP from one user and send it to the other
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        // Find the user who should receive the offer (not the sender)
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    // Handle receiving an answer SDP and send it to the other user
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        // Find the user who should receive the answer (not the sender)
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    // Handle ICE candidates and relay them to the other user
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        // Find the user who should receive the ICE candidate
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
    // Generate a unique room ID
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;

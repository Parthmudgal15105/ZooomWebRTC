"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
// UserManager class handles user management and matchmaking
class UserManager {
    constructor() {
        // Initialize the user list and queue
        this.users = [];
        this.queue = [];
        // Create a RoomManager instance
        this.roomManager = new RoomManager_1.RoomManager();
    }
    // Add a new user to the system
    addUser(name, socket) {
        // Add user to the users list
        this.users.push({
            name, socket
        });
        // Add user's socket ID to the matchmaking queue
        this.queue.push(socket.id);
        // Notify the user they are in the lobby
        socket.emit("lobby");
        // Try to match users in the queue
        this.clearQueue();
        // Set up event handlers for this user's socket
        this.initHandlers(socket);
    }
    // Remove a user from the system
    removeUser(socketId) {
        // Find the user by socket ID
        const user = this.users.find(x => x.socket.id === socketId);
        // Remove user from users list and queue
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x === socketId);
    }
    // Try to match users in the queue into rooms
    clearQueue() {
        console.log("inside clear queues");
        console.log(this.queue.length);
        // If less than 2 users are waiting, do nothing
        if (this.queue.length < 2) {
            return;
        }
        // Get two users from the queue
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        // Find the user objects by their socket IDs
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);
        // If either user is not found, do nothing
        if (!user1 || !user2) {
            return;
        }
        console.log("creating roonm");
        // Create a room for the two users
        const room = this.roomManager.createRoom(user1, user2);
        // Try to match more users if possible
        this.clearQueue();
    }
    // Set up event handlers for WebRTC signaling messages
    initHandlers(socket) {
        // When this user sends an offer, relay it to the other user in the room
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });
        // When this user sends an answer, relay it to the other user in the room
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });
        // When this user sends an ICE candidate, relay it to the other user in the room
        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}
exports.UserManager = UserManager;

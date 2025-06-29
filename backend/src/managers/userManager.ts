// This file defines the UserManager class, which manages users and their matchmaking.
import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

// User interface: represents a connected user
export interface User {
    socket: Socket; // The user's socket connection
    name: string;   // The user's name
}

// UserManager class handles user management and matchmaking
export class UserManager {
    private users: User[]; // List of all connected users
    private queue: string[]; // Queue of user socket IDs waiting for a match
    private roomManager: RoomManager; // Handles room creation and signaling
    
    constructor() {
        // Initialize the user list and queue
        this.users = [];
        this.queue = [];
        // Create a RoomManager instance
        this.roomManager = new RoomManager();
    }

    // Add a new user to the system
    addUser(name: string, socket: Socket) {
        // Add user to the users list
        this.users.push({
            name, socket
        })
        // Add user's socket ID to the matchmaking queue
        this.queue.push(socket.id);
        // Notify the user they are in the lobby
        socket.emit("lobby");
        // Try to match users in the queue
        this.clearQueue()
        // Set up event handlers for this user's socket
        this.initHandlers(socket);
    }

    // Remove a user from the system
    removeUser(socketId: string) {
        // Find the user by socket ID
        const user = this.users.find(x => x.socket.id === socketId);
        // Remove user from users list and queue
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x === socketId);
    }

    // Try to match users in the queue into rooms
    clearQueue() {
        console.log("inside clear queues")
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
        console.log("creating room");

        // Create a room for the two users
        const room = this.roomManager.createRoom(user1, user2);
        // Try to match more users if possible
        this.clearQueue();
    }

    // Set up event handlers for WebRTC signaling messages
    initHandlers(socket: Socket) {
        // When this user sends an offer, relay it to the other user in the room
        socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        })

        // When this user sends an answer, relay it to the other user in the room
        socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })

        // When this user sends an ICE candidate, relay it to the other user in the room
        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }

}
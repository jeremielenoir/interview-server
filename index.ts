import * as express from 'express';
import {Express} from 'express';
import { v4 as uuid} from 'uuid';
import { Server, createServer } from 'http';
import { Server as ServerSocket, Socket} from 'socket.io';

import config from './config';

import * as moment from 'moment';

import Message from './interfaces/Message';
import Data from './interfaces/Data';
import User from './core/User';
import Room from './interfaces/Room';

const app: Express = express();


console.log(app)

//let id: string = uuid()

const httpServer: Server = createServer(
    // {
    //   key: fs.readFileSync(path.join(__dirname, 'SSL_cert', 'key.pem')),
    //   cert: fs.readFileSync(path.join(__dirname, 'SSL_cert', 'cert.pem')),
    // },
    app,
);

const io: ServerSocket = new ServerSocket(httpServer, {})

const rooms: Array<Room> = []
const messages: Array<Message> = []

io.on('connection', (socket: Socket) => {
    io.emit('FromApi', messages);
    socket.emit('my-id', socket.id);

    socket.on('send-call', (data: Data) => {
        io.to(data.userToCall).emit('send-call', {
            signal: data.signalData,
            from: data.from,
        });
    });

    socket.on('receive-call', (data: Data) => {
        io.to(data.to).emit('call-received', data.signal);
    });

    socket.on('newMessage', (message: string) => {
        if (messages.length === 30) {
            messages.shift();
        }

        const newMessage = {
            text: message,
            date: moment().format('HH:mm'),
            id: uuid(),
        };
        messages.push(newMessage);
        console.log('messages : ', messages);
        io.emit('FromAPI', messages);
    });

    socket.on('join room', (roomID: string) => {
  
        const newRoom: Room = {
            id: roomID,
            users: [new User(socket.id)],
        };

        const existingRoom: Room | undefined = rooms.find((room: Room) => room.id === roomID);
        if (existingRoom) {
            const connectedUser: User | undefined = existingRoom.users.find(
                (user: User) => user.id === socket.id
            );

            if (!connectedUser && existingRoom.users.length < 2) {
                const user: User = new User(socket.id)
                existingRoom.users.push(user);
                console.log(`User ${socket.id} joined room ${roomID}`);
            }

            if (!connectedUser && existingRoom.users.length >= 2) {
                existingRoom.users.shift();
                existingRoom.users.push(socket.id);
                console.log(`User ${socket.id} joined room ${roomID}`);
            }

            const otherUser: User | undefined = existingRoom.users.find((user: User) => user.id !== socket.id);
            if (otherUser) {
                socket.emit('other user', otherUser);
                console.log('Room partner: ', otherUser);
            }
        } else {
            rooms.push(newRoom);
            console.log(`User ${socket.id} joined room ${roomID}`);
        }

        io.emit('FromAPI', messages);
    });

    socket.on('leave-call', (data: Data) => {
        console.log(rooms);
        // socket.broadcast.emit('CallEnded');
        const roomToLeave: Room | undefined = rooms.find((room: Room) => room.id === data.room.id);
        if (roomToLeave) {
            const leavingUser: User | undefined = roomToLeave.users.find(
                (user: User) => user.id === data.userID,
            );
            roomToLeave.users.splice(roomToLeave.users.indexOf(leavingUser), 1);
            console.log(`User ${data.userID} left room ${data.room}`);

            const otherUser: User | undefined = roomToLeave.users.find((user: User) => user.id !== socket.id);
            if (otherUser) {
                socket.emit('other user', otherUser);
                console.log('Room partner: ', otherUser);
            }

            if (roomToLeave.users.length < 1) {
                rooms.splice(rooms.indexOf(roomToLeave), 1);
            }
        }
        console.log(rooms);
    });
})

httpServer.listen(config.PORT, () => {
    console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
});
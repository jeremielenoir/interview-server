import express, { Express, Request, Response } from 'express';
import { v4 as uuid} from 'uuid';
import { Server, createServer, IncomingMessage, ServerResponse } from 'http';
import { Server as ServerSocket, Socket} from 'socket.io';
import dayjs from 'dayjs';
import config from './config'

import Message from './interfaces/Message';
import Data from './interfaces/Data';
import User from './interfaces/User'
import Room from './interfaces/Room'


const app: Express = express();


let id: string = uuid()

// const path = require('path');
// const fs = require('fs');



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
            date: dayjs().format('HH:mm'),
            id: uuid(),
        };
        messages.push(newMessage);
        console.log('messages : ', messages);
        io.emit('FromAPI', messages);
    });

    socket.on('join room', (roomID: Room) => {
        const newRoom = {
            id: roomID,
            users: [socket.id],
        };

        const doesRoomExists = rooms.find((room: Room) => room.id === roomID);
        if (doesRoomExists) {
            const isUserConnected = doesRoomExists.users.find(
                (user: string) => user === socket.id,
            );

            if (!isUserConnected && doesRoomExists.users.length < 2) {
                doesRoomExists.users.push(socket.id);
                console.log(`User ${socket.id} joined room ${roomID}`);
            }

            if (!isUserConnected && doesRoomExists.users.length >= 2) {
                doesRoomExists.users.shift();
                doesRoomExists.users.push(socket.id);
                console.log(`User ${socket.id} joined room ${roomID}`);
            }

            const otherUser = doesRoomExists.users.find((user: User) => user !== socket.id);
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
        const roomToLeave = rooms.find((room: any) => room.id === data.room);
        if (roomToLeave) {
            const leavingUser = roomToLeave.users.find(
                (user: any) => user === data.userID,
            );
            roomToLeave.users.splice(roomToLeave.users.indexOf(leavingUser), 1);
            console.log(`User ${data.userID} left room ${data.room}`);

            let otherUser = roomToLeave.users.find((user: any) => user !== socket.id);
            if (otherUser) {
                otherUser = '';
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



/*
/*

/*
const rooms: any = [];
const messages: Message[] = [];

/* pour plus tard
var room = io.sockets.in('some super awesome room');
room.on('join', function() {
  console.log("Someone joined the room.");
});
room.on('leave', function() {
  console.log("Someone left the room.");
});

socket.join('some super awesome room');
socket.broadcast.to('some super awesome room').emit('join');

setTimeout(function() {
  socket.leave('some super awesome room');
  io.sockets.in('some super awesome room').emit('leave');
}, 10 * 1000);


io.on('connection', (socket: any) => {
    io.emit('FromApi', messages);
    socket.emit('my-id', socket.id);

    socket.on('send-call', (data: any) => {
        io.to(data.userToCall).emit('send-call', {
            signal: data.signalData,
            from: data.from,
        });
    });


    socket.on('receive-call', (data: any) => {
        io.to(data.to).emit('call-received', data.signal);
    });

    socket.on('newMessage', (message: any) => {
        if (messages.length === 30) {
            messages.shift();
        }
        const newMessage = {
            text: message,
            date: moment().format('HH:mm'),
          //  id: uuid(),
        };
        messages.push(newMessage);
        console.log('messages : ', messages);
        io.emit('FromAPI', messages);
    });

    socket.on('join room', (roomID: Room) => {
        const newRoom = {
            id: roomID,
            users: [socket.id],
        };

        const doesRoomExists = rooms.find((room: any) => room.id === roomID);
        if (doesRoomExists) {
            const isUserConnected = doesRoomExists.users.find(
                (user: string) => user === socket.id,
            );

            if (!isUserConnected && doesRoomExists.users.length < 2) {
                doesRoomExists.users.push(socket.id);
                console.log(`User ${socket.id} joined room ${roomID}`);
            }

            if (!isUserConnected && doesRoomExists.users.length >= 2) {
                doesRoomExists.users.shift();
                doesRoomExists.users.push(socket.id);
                console.log(`User ${socket.id} joined room ${roomID}`);
            }

            const otherUser = doesRoomExists.users.find((user: any) => user !== socket.id);
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

    // socket.on('offer', (payload) => {
    //   io.to(payload.target).emit('offer', payload);
    // });

    // socket.on('answer', (payload) => {
    //   io.to(payload.target).emit('answer', payload);
    // });

    // socket.on('ice-candidate', (incoming) => {
    //   io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    // });

    socket.on('leave-call', (data: any) => {
        console.log(rooms);
        // socket.broadcast.emit('CallEnded');
        const roomToLeave = rooms.find((room: any) => room.id === data.room);
        if (roomToLeave) {
            const leavingUser = roomToLeave.users.find(
                (user: any) => user === data.userID,
            );
            roomToLeave.users.splice(roomToLeave.users.indexOf(leavingUser), 1);
            console.log(`User ${data.userID} left room ${data.room}`);

            let otherUser = roomToLeave.users.find((user: any) => user !== socket.id);
            if (otherUser) {
                otherUser = '';
                socket.emit('other user', otherUser);
                console.log('Room partner: ', otherUser);
            }

            if (roomToLeave.users.length < 1) {
                rooms.splice(rooms.indexOf(roomToLeave), 1);
            }
        }
        console.log(rooms);
    });
});



*/
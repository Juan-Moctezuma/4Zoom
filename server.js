// Socket.io allows bi-directional communication between users and servers.
// WebRTC allows realtime communication between browsers
// PeerJS wraps WebRTC implementation

// All JS FOR SERVER IS LOCATED HERE
/**
 * MAIN VARIABLE INITIALIZATION & SETUP
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const users = {};
let usersLimit = 4;
app.set('view engine', 'ejs');
app.use(express.static('public'));

/**
 * PEER JS SETUP (CREATES ID FOR CHAT ROOM)
 */
app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
    //res.status(200).send("TEST"); // For testing purposes, this can be deleted
    //res.render('conferenceRoom'); // No need to write '.ejs' within render function
    res.redirect(`/${uuidv4()}`); // String Literals
});

/**
 * ROUTE THAT GETS CHAT ROOM ID
 */
app.get('/:conferenceRoom', (req, res) => {
    res.render('conferenceRoom', { roomId: req.params.conferenceRoom })
});

/**
 * CODE BLOCK FOR SOCKET CONNECTION
 */
io.on('connection', socket => {
    socket.on('join-room', (roomId, name) => {
        socket.on('new-user', name => {
            users[socket.id] = name
            socket.broadcast.emit('user-connected', name)
        });
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', name);
        socket.on('message', message => {
            io.to(roomId).emit('chat-message', { message: message, name: users[socket.id] })
        });

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', name)
        });
    });
    // CHAT ROOM HAS A LIMIT FOR 4 USERS ONLY
    if (io.engine.clientsCount > usersLimit) {
        socket.emit('err', { message: 'reach the limit of connections' })
        socket.disconnect()
        console.log('Disconnected...')
        return
      };
});

// You can select any localhost, for instance '3000' or '9000'
//server.listen(3095);
server.listen(process.env.PORT || 3095);

//importing express
const express = require("express");
const path = require("path");

//new express instance
const app = express();

//serve static files
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use(express.static("../public"))
//serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

//creates an http server using the created express app
const server = require("http").Server(app);
//attaching socket io to http server
const io = require("socket.io")(server);
const port = 3000;

if (!server.listening){

    server.listen(port, "0.0.0.0", ()=>{

        console.log(`Server has been initiated at http://localhost:${port}`)

    })

}

else console.log("Server has already been initiated")

const characters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I",
    "J", "K", "L", "M", "N", "O", "P", "Q", "R",
    "S", "T", "U", "V", "W", "X", "Y", "Z", "1",
    "2", "3", "4", "5", "6", "7", "8", "9", "0"
]

const tokens = {};
const usernames = [];
const rooms = {};

/*

tokens[ID] = {

    username: username,
    sockets: [socketID],
    rooms: [],
    lastLoggedOn: null,


}

*/

rooms["abcd"] = {

    host: null,
    hostToken: null,
    users: {},
    isDirty: false

}

/*
rooms[ID] = {

    host: username
    hostToken: tokenID
    users: {}
    isDirty: false

}

users[tokenID] = {

    socketID: socketid,
    username: username,

}
*/ 

//on connection tasks
io.on("connection", (socket)=>{

    socket.on("connection-protocol", (givenToken)=>{

        if (tokens[givenToken]){
            socket.emit("existing-token", tokens[givenToken].username)
            socket.data.token = givenToken;
            socket.data.username = tokens[givenToken].username;
            socket.data.roomID = null;
            tokens[givenToken].lastLoggedOn = null;
        }

        else{

            socket.emit("invalid-token")
            console.log('invalid token')

        }

    })

    socket.on("create-user", (username)=>{

        let validUsername = validateUsername(username);
        console.log(validUsername)

        if (!validUsername[0]){

            socket.emit("invalid-username", validUsername[1]);

        }

        else {
            let createdToken = generateToken(username, socket.id)
            socket.data.token = createdToken;
            socket.data.username = username;
            socket.emit("valid-username", validUsername[1], socket.data.token, socket.data.username);
        }

    })

    socket.on("join-room", (givenRoomCode)=>{

        let existingRoom = rooms[givenRoomCode];

        if (!existingRoom){
            socket.emit("invalid-room", "Room does not exist.");
            return;
        }

        if (existingRoom.users[socket.data.token]){

            console.log(`existing: ${existingRoom.tokens}`)
            socket.emit("invalid-room", "You are already in that room.");
            return;

        }

        socket.emit("valid-room", givenRoomCode)

    })

    socket.on("validate-room-entrance", (givenRoomCode)=>{

        let loweredRoomCode = givenRoomCode.toLowerCase();

        if (!rooms[loweredRoomCode]){
            socket.emit("invalid-room-entrance", "Room does not exist."); 
            return;
        }

        if (tokens[socket.data.token].rooms.includes(loweredRoomCode)) {
            socket.emit("invalid-room-entrance", "You are already in this room"); 
            return;
        }

        tokens[socket.data.token].rooms.push(loweredRoomCode);
        rooms[loweredRoomCode].users[socket.data.token] = {

            socketID: socket.id,
            username: socket.data.username

        }
        socket.data.roomID = loweredRoomCode;

        socket.join(loweredRoomCode);
        socket.to(loweredRoomCode).emit("other-user-joined", socket.data.username, socket.id);

        let usersList = [];

        Object.keys(rooms[loweredRoomCode].users).forEach((roomUser)=>{

            if (roomUser == socket.data.token) return;

            let data = {}
            data.socketID = rooms[loweredRoomCode].users[roomUser].socketID;
            data.username = rooms[loweredRoomCode].users[roomUser].username;

            usersList.push(data);

        })

        socket.emit("get-room-users", usersList);

    })

    socket.on("disconnect", ()=>{

        if (!tokens[socket.data.token]){return}

        const foundSocketIndex = tokens[socket.data.token].sockets.indexOf(socket.id);
        tokens[socket.data.token].sockets.splice(foundSocketIndex, 1);

        if (tokens[socket.data.token].sockets.length === 0){

            tokens[socket.data.token].lastLoggedOn = Date.now();

        }

        if (socket.data.roomID){

            let socketRoomID = socket.data.roomID;
            delete rooms[socketRoomID].users[socket.data.token];
            console.log(rooms[socketRoomID].users);

            let foundRoomIndex = tokens[socket.data.token].rooms.indexOf(socketRoomID);
            tokens[socket.data.token].rooms.splice(foundRoomIndex, 1);
            io.to(socket.data.roomID).emit("user-left-room", socket.id);

        }

    })

})

function generateToken(username, socketID){

    const createdToken = String(Math.random().toString(36).substring(2));
    while (tokens[generateToken]) createdToken = String(Math.random().toString(36).substring(2));

    tokens[createdToken] = {

        username: username,
        sockets: [socketID],
        rooms: [],
        lastLoggedOn: null,

    }

    usernames.push(username)
    
    return createdToken;

}

function validateUsername(username){

    const MAX_LENGTH = 12;
    console.log(username)

    if (username.length > MAX_LENGTH) return [false, "Invalid, username too long."];
    else if (username.length === 0) return [false, "Invalid, username too short."];
    else if (username.includes(" ")) return [false, "Invalid, username includes spaces."];
    else if (usernames.includes(username)) return [false, "Invalid, username is currently in use"];
    else return [true, "Valid username."];

}

async function tokensLoop(){

    const hours = 0.5;
    const milisecondConvertion = 3600000;
    const expiryTime = hours * milisecondConvertion; // converting hours to miliseconds
    const currentTime = Date.now();

    const waitTimeHours = 0.4;
    const waitTime = waitTimeHours * milisecondConvertion;

    console.log('loop')

    Object.keys(tokens).forEach(code => {
        console.log(`last logged on ${tokens[code].lastLoggedOn}`)
        if (!tokens[code].lastLoggedOn) return;
        if ((currentTime - tokens[code].lastLoggedOn) >= expiryTime) {
            
            let usernameIndex = usernames.indexOf(tokens[code].username);
            usernames.splice(usernameIndex, 1);
            delete tokens[code];

            console.log('delete token')

        }
    });

    await wait(waitTime);
    tokensLoop();
    
}
tokensLoop();

function wait (waitTime){

    return new Promise(resolve => setTimeout(resolve, waitTime))

}
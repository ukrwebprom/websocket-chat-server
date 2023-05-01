const express = require('express');
var cors = require('cors');
const http = require('http');
const WebSocketServer = require('ws');
const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
var sr = require('simple-random');

const users = [];
const chats = [];

const httpServer = http.createServer(app);
const server = new WebSocketServer.WebSocketServer({server: httpServer});

const getUserByHash = (hash) => users.find(u => u.Hash === hash);
const getChatUsers = (chat) => users.filter(u => u.chat === chat);
const sendToAll = (chatID, m) => users.filter(u => u.chat === chatID).forEach(w => w.ws.send(JSON.stringify(m)));

/* check if the chat exist and return chat users or null */
app.get('/chat', (req, res) => { 
    const chat = req.query.id;
    if(chats.includes(chat)) res.send(getChatUsers(chat).map(u => u.uid));
    else res.send(null);
  })

/* create a new chat. return new chat object */
app.post('/chat', (req, res) =>{
    const chatID = req.body.id;
    if(!chats.includes(chatID)) {
        const n = chats.push(chatID);
        res.send(chats[n-1]);
        console.log("chats:", chats);
    }
    else throw new Error('CHAT IS EXIST');
})

/* add user to chat */
app.post('/chat/user', (req, res) =>{
    const chatID = req.body.id;
    const Hash = req.body.hash;
    const uid = req.body.uid;
    console.log('chat to enter:', chatID)
    if(chats.includes(chatID)) {
        getUserByHash(Hash).chat = chatID;
        getUserByHash(Hash).uid = uid;
        res.send(getChatUsers(chatID).map(u => u.uid));
    }
    else throw new Error('CHAT IS NOT EXIST');
})

httpServer.listen(port, () => {console.log('listening')})

/* const sendToAll = (id, message) => {
    users.filter(u => u.chatID === id).forEach(e => {
        console.log('send');
        e.ws.send(JSON.stringify(message))});
}
const getChatUsers = (chatID) => {
    const usersList = users.filter(u => u.chatID === chatID).map(u => {
        return {
            userID: u.userID, 
            photo: u.photo, 
            name: u.name
          }
    })
    console.log(usersList);
    return usersList;
} */

const removeUser = (zombieHash) => {
    
    if(typeof getUserByHash(zombieHash) !== 'undefined') {

        for( var i = 0; i < users.length; i++){ 
                                       
            if ( users[i].Hash === zombieHash) { 
                users.splice(i, 1); 
                break;
            }
        }
    }
}


server.on('connection', (ws, req) => {
    const url = new URL(req.url, 'wss://tranquil-reaches-58824.herokuapp.com/');
    const Hash = url.searchParams.get('Hash');
    console.log("Connected:", Hash)
    if(!users.find(u => u.Hash === Hash)) users.push({ws, Hash, chat:"", uid:""});

    const sendPing = () => {
        ws.send(JSON.stringify('ping'));
    }

    let ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        removeUser(Hash);
        clearInterval(ping);
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log("got message:", data);
        const chatToSend = getUserByHash(Hash).chat;
        sendToAll(chatToSend, data);
    })
})
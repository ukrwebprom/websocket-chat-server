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
const clearChats = () => {
    for( var i = 0; i < chats.length; i++){ 
        if(getChatUsers(chats[i]).length === 0) { 
            chats.splice(i, 1); 
            break;
        }
    }
}
setInterval(clearChats, 1800000);

app.get('/chat/users', (req, res) => { 
    const chat = req.query.id;
    if(chats.includes(chat)) res.send(getChatUsers(chat).map(u => u.uid));
    else res.send(null);
  })

/* check if the chat exist and return chat users or null */
app.get('/chat', (req, res) => { 
    const chat = req.query.id;
    if(chats.includes(chat)) res.send(true);
    else res.send(false);
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

/* leave chat */
app.delete('/chat/user', (req, res) =>{
    console.log(req.body);
    const Hash = req.body.hash;
/*     getUserByHash(Hash).chat = ''; */
    res.send('deleted');
})

httpServer.listen(port, () => {console.log('listening')})


const removeUser = (zombieHash) => {
    
    if(typeof getUserByHash(zombieHash) !== 'undefined') {
        const chat = getUserByHash(zombieHash).chat;
        for( var i = 0; i < users.length; i++){ 
                                       
            if ( users[i].Hash === zombieHash) { 
                users.splice(i, 1); 
                break;
            }
        }
        sendToAll(chat, 'need_upd');
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
        const chatToSend = getUserByHash(Hash).chat;
        sendToAll(chatToSend, data);
    })
})
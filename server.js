const path=require("path");
const http=require("http");
const express=require("express");
const socketio=require("socket.io");
const formatMessage=require("./utils/messages");
const {userJoin,getCurrentUser,userLeave,getRoomUsers} =require("./utils/users");
const { getUnpackedSettings } = require("http2");

const app=express();
const server=http.createServer(app);
const io=socketio(server);


app.use(express.static(path.join(__dirname,"public")));
//run when client connect
const botName='ChatCord Bot';

io.on("connection",(socket)=>{
    socket.on("joinRoom",({username,room})=>{
        const user=userJoin(socket.id ,username,room);
socket.join(user.room);
        socket.emit("message",formatMessage(botName,"welcome to chatcord"));

        //broadcast whe user connect
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit("roomUsers",{
            room:user.room,
users:getRoomUsers(user.room)
        });
           
    });
    

    
    //listen for chatmssg

    socket.on("chatMessage",(msg)=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit("message",formatMessage(user.username,msg));
    });
 
        //run when client disconnct

    socket.on("disconnect",()=>{
        const user=userLeave(socket.id);
        if(user){
            
            io.to(user.room).emit("message",formatMessage(botName,` ${user.username} had left the chat`));


            //send users and room info
        io.to(user.room).emit("roomUsers",{
            room:user.room,
users:getRoomUsers(user.room)
        });
        }
    });
    
});

const Port= process.env.PORT;
server.listen(Port,(socket)=>{
    console.log(`server running on ${Port}`)
})

import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box, Button, Container, Stack, TextField, Typography,
} from "@mui/material";
// 1st Approach 

// UseEffect re-render the component , so my socket cokkendition do again and again , 
// that's i make this socket connection outside component

// const socket = io("http://localhost:3000/")

const App = () => {

  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true,
      }),
    []
  );
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("")
  const [socketId, setSocketId] = useState("")
  const [messageArray, setMessageArray] = useState([])
  const [roomName, setRoomName] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();

    // Make a event which name is message , But this event is trigger from frontend side 
    // socket.emit("message", message);

    socket.emit("message", { message, room })
    setMessage("");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit('join-room', roomName)
    setRoomName("")
  }

  // Page load then useffect execute
  useEffect(() => {
    console.log('Socket Connected Successfully');

    // Pre-Build Event -> For Client Side 
    socket.on("connect", () => {
      setSocketId(socket.id)
      console.log("Connected -> ", socket);
      console.log("socket.id -> ", socket.id);
      console.log("socket.connected -> ", socket.connected);
    });

    socket.on("Welcome", (data) => {
      console.log("This message come from server side after trigger emit welcome -> ", data);
      // socket.emit("message to every-one", data);
    });

    socket.on("Broadcast_Message", (data) => {
      console.log(data);
    });

    socket.on("receive-message", (data) => {
      console.log("Received message is ", data)

      setMessageArray((message) => [...message, data])
    });

    // Arrow Function
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container maxWidth='sm'>
      <Typography>
        Welcome to Socket.io
      </Typography>

      <Typography>
        {socketId}
      </Typography>

      <form onSubmit={handleJoinRoom}>
        <h5>Join Room</h5>

        <TextField value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value)
          }}
          id='outlined-basic'
          label='Room Name'
          variant='outlined' />

        <Button type='submit' variant='contained' color='primary'>Join Room</Button>
      </form>
      <form onSubmit={handleSubmit}>
        <TextField value={message}

          onChange={(e) => {
            setMessage(e.target.value)
          }}
          id='outlined-basic'
          label='Message'
          variant='outlined' />

        <TextField value={room}
          onChange={(e) => {
            setRoom(e.target.value)
          }}
          id='outlined-basic'
          label='Room'
          variant='outlined' />

        <Button type='submit' variant='contained' color='primary'>Send Message</Button>
      </form>
      <Stack>
        {messageArray?.map((msg, index) => (
          <Typography key={index} variant="h6" component="div" gutterBottom>
            {msg}
          </Typography>
        ))}
      </Stack>
    </Container>
  )
}

export default App

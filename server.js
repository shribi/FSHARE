const express = require("express");
const path = require("path");

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADTxeyy_3jv7z-GaUq7SkkFhZbBdVpkb0",
  authDomain: "fshare-7be94.firebaseapp.com",
  projectId: "fshare-7be94",
  storageBucket: "fshare-7be94.appspot.com",
  messagingSenderId: "88675509218",
  appId: "1:88675509218:web:bd0d963ea6f1508943cfbb",
  measurementId: "G-7JL7F7SWD2"
};

// Initialize Firebase
const app1 = initializeApp(firebaseConfig);
const analytics = getAnalytics(app1);

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);
var port_number = server.listen(process.env.PORT || 5000);


app.use(express.static(path.join(__dirname+"/theme")));
app.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/theme/home.html'));
});

io.on("connection", function(socket){
	socket.on("sender-join",function(data){
		socket.join(data.uid);
	});
	socket.on("receiver-join",function(data){
		socket.join(data.uid);
		socket.in(data.sender_uid).emit("init", data.uid);
	});
	socket.on("file-meta",function(data){
		socket.in(data.uid).emit("fs-meta", data.metadata);
	});
	socket.on("fs-start",function(data){
		socket.in(data.uid).emit("fs-share", {});
	});
	socket.on("file-raw",function(data){
		socket.in(data.uid).emit("fs-share", data.buffer);
	})
});

app.listen(port_number);

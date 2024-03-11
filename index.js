const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

process.env.GOOGLE_APPLICATION_CREDENTIALS;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

initializeApp({
  credential: applicationDefault(),
  projectId: "chatify-827b3",
});

app.post("/send", async function (req, res) {
  const { type, receiverId, senderId, message, fcmToken } = req.body;
  const { token } = req.query;

  if (atob(token) !== process.env.SECRET_TOKEN) {
    res.status(400);
    res.send({ message: "Invalid Token" });
    console.log("Error sending message: Invalid Token");
    return;
  }

  const db = getFirestore();

  const userSnap = await db.collection("users").doc(senderId).get();
  const userData = userSnap.data();

  const title = `${userData["displayName"] || `New ${type}`}`;

  const fcmMessage = {
    notification: {
      title: title,
      body: message,
    },
    data: {
      type: type,
      receiverId: receiverId,
      senderId: senderId,
      title: title,
      body: message,
    },
    token: fcmToken,
  };

  getMessaging()
    .send(fcmMessage)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

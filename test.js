import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("HELLO SAM");
});

app.listen(3005, () => {
  console.log("Running on http://localhost:3005");
});

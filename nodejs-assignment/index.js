const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/assignmentDB", { useNewUrlParser: true, useUnifiedTopology: true });

const numberSchema = new mongoose.Schema({
  number: Number,
  file: String,
});

const NumberModel = mongoose.model("Number", numberSchema);

app.post("/submit", async (req, res) => {
  try {
    // Check if all files (A, B, C, D) are already populated
    const files = await NumberModel.distinct("file");
    if (files.length === 4) {
      return res.status(400).send({
        status: false,
        message: "All files have been populated. Process complete. No more numbers can be entered.",
      });
    }

    const inputNumber = req.body.number;

    if (typeof inputNumber !== "number" || inputNumber < 1 || inputNumber > 25) {
      //check valid number
      return res.status(400).send({
        status: false,
        message: "Invalid input. Number must be between 1 and 25.",
      });
    }

    const resultNumber = inputNumber * 7;

    let fileName = "D";
    if (resultNumber > 140) {
      fileName = "A";
    } else if (resultNumber > 100) {
      fileName = "B";
    } else if (resultNumber > 60) {
      fileName = "C";
    }

    const newEntry = new NumberModel({ number: resultNumber, file: fileName });
    await newEntry.save(); // save to db

    res.status(200).send({
      status: true,
      message: `Number saved in file ${fileName}.`,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/numbers", async (req, res) => {
  try {
    const numbers = await NumberModel.find({});
    res.status(200).send({
      status: true,
      message: "Numbers fetched successfully.",
      data: numbers,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/", async (req, res) => {
  return res.status(200).send({
    status: true,
    message: "hello from Assignment Apis",
  });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("MongoDb Connected")
});

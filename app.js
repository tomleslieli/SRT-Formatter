const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", upload.single("file"), (req, res) => {
  const exceptions = req.body.exceptions
    ? req.body.exceptions.split(",").map((e) => e.trim().toLowerCase())
    : [];
  console.log("Exceptions:", exceptions);
  const originalFilename = path.parse(req.file.originalname).name;
  const filePath = path.join(__dirname, req.file.path);
  const newFilePath = path.join(
    __dirname,
    "uploads",
    `${originalFilename}-processed.srt`
  );

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("File read error:", err);
      return res.status(500).send("File read error");
    }

    const processedContent = processSrt(data, exceptions);

    fs.writeFile(newFilePath, processedContent, (err) => {
      if (err) {
        console.error("File write error:", err);
        return res.status(500).send("File write error");
      }

      res.download(newFilePath, `${originalFilename}-processed.srt`, (err) => {
        if (err) {
          console.error("File download error:", err);
          return res.status(500).send("File download error");
        }
        fs.unlink(filePath, (err) => {
          if (err) console.error("File delete error (original):", err);
        });
        fs.unlink(newFilePath, (err) => {
          if (err) console.error("File delete error (updated):", err);
        });
      });
    });
  });
});

function processSrt(data, exceptions) {
  const exceptionsSet = new Set(exceptions);
  console.log("Exceptions Set:", exceptionsSet); // Log exceptions set
  const punctuationRegex = /[^\w\s'"?:]/g; // Include apostrophes, dashes, question marks, colons, and quotation marks

  return data
    .split("\n")
    .map((line) => {
      if (line.match(/^\d+$/) || line.includes("-->")) {
        return line;
      }

      return line
        .replace(/[^\w\s'"?:]/g, (char) => {
          return char === "'" ||
            char === "-" ||
            char === "?" ||
            char === ":" ||
            char === '"'
            ? char
            : ""; // Keep apostrophes, dashes, question marks, colons, and quotation marks, remove other punctuation
        })
        .replace(/\b\w+\b/g, (word) => {
          const cleanWord = word.toLowerCase();
          console.log("Original Word:", word, "Clean Word:", cleanWord);
          if (exceptionsSet.has(cleanWord)) {
            console.log("Original word is an exception:", word);
            return word; // Return the original word if it's in exceptions
          }
          console.log(
            "Original word is not an exception, returning clean word:",
            cleanWord
          );
          return cleanWord;
        });
    })
    .join("\n");
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

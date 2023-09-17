const express = require("express");
const multer = require("multer");
const csvtojson = require("csvtojson");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Create a directory for file uploads (make sure this directory exists)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Create a directory for file downloads (make sure this directory exists)
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Handle file upload and conversion
app.post("/upload", upload.single("file"), async (req, res) => {
    const uploadedFile = req.file;

    if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const csvFilePath = uploadedFile.path;
    const jsonFileName = uploadedFile.originalname.replace(".csv", ".json");
    const jsonFilePath = path.join(uploadDir, jsonFileName);

    try {
        const jsonArray = await csvtojson().fromFile(csvFilePath);

        // Write the JSON data to a file
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));

        // Once conversion is done, send a response with the JSON file path
        return res.json({ jsonFilePath });
    } catch (error) {
        console.error("CSV to JSON conversion error:", error);
        return res.status(500).json({ error: "Conversion failed" });
    }
});

// Handle file download
app.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    // Send the JSON file to the client for download
    res.download(filePath);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

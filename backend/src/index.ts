// Import necessary modules from express for creating the server.
import express, { Request, Response } from "express";
// Import the PINATA_GATEWAY and PINATA_JWT constants from the config file.
import { PINATA_GATEWAY, PINATA_JWT } from "./config";
// Import cors middleware for handling Cross-Origin Resource Sharing.
import cors from "cors";
// Import multer middleware for handling file uploads.
import multer from "multer";
// Import the fs module for file system operations.
import fs from "fs";
// Import the PinataSDK for interacting with the Pinata API.
import { PinataSDK } from "pinata";

// Initialize the Pinata SDK with the JWT and Gateway.
const filesClient = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

// Create an instance of the express application.
const app = express();
// Define the port number the server will listen on.
const PORT = 5171;

// Middleware configuration
// Use express.json() middleware to parse JSON request bodies.
app.use(express.json());
// Use cors() middleware to enable Cross-Origin Resource Sharing.
app.use(cors());

// Define routes
// Define a simple route for the root endpoint.
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

// Route to fetch files from Pinata
app.get("/get-files", async (req: Request, res: Response) => {
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  };
  const result = await fetch("https://api.pinata.cloud/v3/files", options);
  const data = await result.json();
  console.log(data.data.files);
  res.send(data.data.files);
});

// Configure multer for file uploads, specifying the destination folder.
const upload = multer({ dest: "uploads/" });

// Route to handle file uploads
app.post(
  "/upload-file",
  upload.single("file"), // Use multer middleware to handle a single file upload.
  async (req: Request, res: Response): Promise<void> => {
    // Extract the file from the request.
    const file = req.file;
    // If no file was uploaded, return a 400 error.
    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    // Read the file from the temporary path.
    const fileBuffer = fs.readFileSync(file.path);
    // Create a Blob from the file buffer.
    const blob = new Blob([fileBuffer], { type: file.mimetype });

    // Create a File object from the Blob.
    const FileObj = new File([blob], file.originalname, {
      type: file.mimetype,
    });

    console.log(file);

    try {
      // Upload the file to Pinata using the Pinata SDK.
      const response = await filesClient.upload.file(FileObj);

      console.log(response);
      // If the upload was successful, send the response.
      if (response.cid) {
        res.send(response);
      } else {
        // If the upload failed, return a 500 error.
        res.status(500).send("Error uploading file to IPFS.");
      }
    } catch (error) {
      // If an error occurred, log it and return a 500 error.
      console.error(error);
      res.status(500).send("Error uploading file to IPFS.");
    } finally {
      // Remove the file from the server's temporary storage.
      fs.unlinkSync(file.path); // Remove the file from the server
    }
  }
);

// Route to get a private URL for a file
app.get("/get-private-url/:cid", async (req: Request, res: Response) => {
  // Extract the CID from the request parameters.
  const cid = req.params.cid;
  // Create a signed URL for the file using the Pinata SDK.
  const url = await filesClient.gateways.createSignedURL({
    cid: cid,
    expires: 10,
  });
  // Send the signed URL in the response.
  res.send(url);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

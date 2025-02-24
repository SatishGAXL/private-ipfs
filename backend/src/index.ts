import express, { Request, Response } from "express";
import { PINATA_GATEWAY, PINATA_JWT } from "./config";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { PinataSDK } from "pinata";

const filesClient = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

const app = express();
const PORT = 5171;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

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

const upload = multer({ dest: "uploads/" });

app.post(
  "/upload-file",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const fileBuffer = fs.readFileSync(file.path);
    const blob = new Blob([fileBuffer], { type: file.mimetype });

    const FileObj = new File([blob], file.originalname, {
      type: file.mimetype,
    });

    console.log(file);

    try {
      const response = await filesClient.upload.file(FileObj);

      console.log(response);
      if (response.cid) {
        res.send(response);
      } else {
        res.status(500).send("Error uploading file to IPFS.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading file to IPFS.");
    } finally {
      fs.unlinkSync(file.path); // Remove the file from the server
    }
  }
);

app.get("/get-private-url/:cid", async (req: Request, res: Response) => {
  const cid = req.params.cid;
  const url = await filesClient.gateways.createSignedURL({
    cid: cid,
    expires: 10,
  });
  res.send(url);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

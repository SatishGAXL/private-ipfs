// Import the dotenv library to load environment variables from a .env file.
import { config } from "dotenv";
// Load environment variables from the .env file into process.env.
config();
// Export the PINATA_JWT environment variable, or an empty string if it's not defined.
export const PINATA_JWT = process.env.PINATA_JWT || "";
// Export the PINATA_GATEWAY environment variable, or an empty string if it's not defined.
export const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "";
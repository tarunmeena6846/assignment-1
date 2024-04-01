/**
 * @swagger
 * /api/publicapis:
 *   get:
 *     summary: Get public APIs
 *     description: Retrieve a list of public APIs with optional filtering by category and limit.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of results to return
 *     responses:
 *       '200':
 *         description: A list of public APIs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of APIs returned
 *                 entries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       API:
 *                         type: string
 *                         description: Name of the API
 *                       Description:
 *                         type: string
 *                         description: Description of the API
 *                       Auth:
 *                         type: string
 *                         description: Authentication method (if any)
 *                       HTTPS:
 *                         type: boolean
 *                         description: Whether the API supports HTTPS
 *                       Cors:
 *                         type: string
 *                         description: Cross-Origin Resource Sharing (CORS) support
 *
 * /api/balance/{address}:
 *   get:
 *     summary: Fetch the balance of an Ethereum account.
 *     description: Retrieves the balance of the specified Ethereum account.
 *     parameters:
 *       - in: path
 *         name: address
 *         description: Ethereum address to fetch the balance for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the balance of the Ethereum account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: string
 *                   description: The balance of the Ethereum account in ether.
 *       '400':
 *         description: Bad request due to an invalid Ethereum address.
 *       '500':
 *         description: Internal server error.
 */
import express, { Router, Response } from "express";
import { detokenizeAdmin } from "../middleware/index";
import { AuthenticatedRequest } from "../middleware/index";
import axios from "axios";
import Web3 from "web3";
import { isAddress } from "web3-validator";
const PUBLIC_API_URL = "https://api.publicapis.org";
const web3 = new Web3(
  "https://mainnet.infura.io/v3/1c641c5e6073430e9797c24b9ad209de"
);

const router: Router = express.Router();
// Retrieve the entire portfolio with trades
router.get(
  "/publicapis",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Extract query parameters for filtering
      const { category, limit } = req.query;
      console.log(category, limit);
      // Construct the API URL with filtering options
      let apiUrl = `${PUBLIC_API_URL}/entries`;
      if (category) {
        apiUrl += `?category=${encodeURIComponent(category as string)}`;
      }
      if (limit) {
        apiUrl += `${category ? "&" : "?"}limit=${encodeURIComponent(
          limit as string
        )}`;
      }

      // Fetch data from the public API
      const response = await axios.get(apiUrl);

      // Return the data fetched from the public API
      res.json(response.data);
    } catch (error: any) {
      // Handle errors
      console.error(
        "Error fetching data:",
        error.response ? error.response.data : error.message
      );
      res
        .status(error.response ? error.response.status : 500)
        .json({ error: "Internal Server Error" });
    }
  }
);

// Route to fetch the balance of an Ethereum account
router.get(
  "/balance/:address",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const address = req.params.address;

      if (!isAddress(address)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Fetch the balance of the specified account
      const balance = await web3.eth.getBalance(address);

      // Convert balance from wei to ether
      const balanceInEther = web3.utils.fromWei(balance, "ether");

      res.json({ balance: balanceInEther });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
export default router;

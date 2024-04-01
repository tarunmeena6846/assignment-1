/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User Signup
 *     description: Register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user.
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *     responses:
 *       '200':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 token:
 *                   type: string
 *                   description: JWT token for the registered user.
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *
 * /auth/me:
 *   get:
 *     summary: Get User Details
 *     description: Retrieve details of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 userEmail:
 *                   type: string
 *                   description: Email of the authenticated user.
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 userEmail:
 *                   type: string
 *                   description: Email of the authenticated user.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Log in with username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user.
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: Confirmation message.
 *                 token:
 *                   type: string
 *                   description: JWT token for the authenticated user.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 */

import express, { Router, Request, Response } from "express";
import { detokenizeAdmin, secretKey } from "../middleware/index";
import jwt, { JwtPayload } from "jsonwebtoken";

const router: Router = express.Router();
import { AuthenticatedRequest } from "../middleware/index";
import userModel, { user } from "../models/user";

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log("tarun", username, password);
    if (!username || !password) {
      res.status(400).json({ error: "Bad request", success: false });
      return;
    }
    const bIsAdminPresent: user | null = await userModel.findOne({
      username: username,
      password: password,
    });
    if (!bIsAdminPresent) {
      if (secretKey) {
        let token = jwt.sign(
          {
            username: req.body.username,
          },
          secretKey,
          { expiresIn: "1h" }
        );
        const newAdmin: user = new userModel({
          username: username,
          password: password,
        });
        newAdmin.save();
        res.status(201).send({
          message: "User registered successfully",
          success: true,
          token: token,
        });
      } else {
        console.error(
          "JWT_SECRET environment variable is not set. Unable to sign JWT."
        );
        res.status(500).json({
          error: "Internal server error",
          success: false,
          token: null,
        });
      }
    } else {
      res.status(200).send({
        content: "Admin already registered",
        success: false,
        token: null,
      });
    }
  } catch (error: any) {
    console.error("Error in user signup:", error);
    res
      .status(500)
      .json({ error: "Internal server error", success: false, token: null });
  }
});

router.get(
  "/me",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user) {
        const bIsAdminPresent = await userModel.findOne({
          username: req.user,
        });
        console.log(" bIsAdminPresent at /me route", bIsAdminPresent);
        if (bIsAdminPresent) {
          res.status(200).send({
            success: true,
            userEmail: bIsAdminPresent.username,

            // userData: bIsAdminPresent,
            // subscription: bIsAdminPresent.subscriptions,
          });
        } else {
          res.status(401).send({ success: false, userEmail: "" });
        }
      } else {
        res.status(401).send({ success: false, userEmail: "" });
      }
    } catch (error: any) {
      console.error("Error in admin signup:", error);
      res.status(500).json({ error: "Internal server error", success: false });
    }
  }
);
// TODO add the below logic to a common place for the autentcation
router.post("/login", async (req: Request, res: Response) => {
  console.log(req.headers.username, req.headers.password);
  const bIsAdminPresent = await userModel.findOne({
    username: req.headers.username,
    password: req.headers.password,
  });

  if (bIsAdminPresent) {
    // currentUserId = bIsAdminPresent.username;
    if (secretKey) {
      const token = jwt.sign(
        { username: req.headers.username, role: "admin" },
        secretKey,
        { expiresIn: "1h" }
      );
      res.status(200).send({
        content: "Login successfully",
        token: token,
        success: true,
      });
    } else {
      console.error(
        "JWT_SECRET environment variable is not set. Unable to sign JWT."
      );
      res.status(500).json({ error: "Internal server error", success: false });
    }
  } else {
    res.status(401).send({ message: "unauthorised", success: false });
  }
});

export default router;

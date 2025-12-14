import { prisma } from "../lib/prisma.ts";
import jwt from "jsonwebtoken";
import { encrypt } from "../lib/encryption.js";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES = "7d";

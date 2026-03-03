// lib/auth/resolveWallet.js
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma"

function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function getApiKeyFromReq(req) {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (token) return token;
  }

  return null;
}

export async function resolveWallet(req, res) {
  // 1) API key auth (for curl / internal usage)
  const apiKeyRaw = getApiKeyFromReq(req);

  if (apiKeyRaw) {
    // the API-Key is sha256 hashed stored in DB
    const apiKeyHash = sha256(apiKeyRaw);

    const wallet = await prisma.wallet.findFirst({
      where: { apiKeyHash: apiKeyHash },
    });

    if (!wallet) return { wallet: null, reason: "invalid_api_key" };
    return { wallet, reason: "api_key" };
  }

  // 2) Session auth (browser)
  const session = await getServerSession(req, res, authOptions);
  return {wallet: session?.wallet || undefined, reason: "session"}
}
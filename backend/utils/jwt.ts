import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: string;
}

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET ||
      "ba5ebcfdff6f4eb2a09dece92cc71e6e69650a29526340eea2d23773d4362f2c",
    { expiresIn: "7d" },
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET ||
      "ba5ebcfdff6f4eb2a09dece92cc71e6e69650a29526340eea2d23773d4362f2c",
  ) as JwtPayload;
};

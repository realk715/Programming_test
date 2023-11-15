"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const Authentication = (req, res, next) => {
    const header = req.headers;
    if (header.token === undefined || header.token === null) {
        return res.status(401).json({ message: 'Need headers token ' });
    }
    try {
        if (header.token) {
            const decodedToken = jsonwebtoken_1.default.verify(header.token, String(process.env.SECRET));
            if (decodedToken) {
                req.decodedToken = decodedToken;
                next();
            }
        }
        else {
            throw new Error('Unauthorized Token expired or wrong token');
        }
    }
    catch (err) {
        // ตรวจสอบว่า error เป็น JsonWebTokenError หรือไม่
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            // ส่ง response กลับไปที่ client
            return res.status(401).json({ message: 'Wrong token' });
        }
    }
};
exports.default = Authentication;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_ctr_1 = __importDefault(require("../ctr/user_ctr"));
const auth_ctr_1 = __importDefault(require("../ctr/auth_ctr"));
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userCtr = new user_ctr_1.default();
    const result = yield userCtr.register(req.body);
    res.json(result).status(result.status);
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userCtr = new user_ctr_1.default();
    const result = yield userCtr.login(req.body);
    res.json(result).status(result.status);
}));
router.post('/transfer', auth_ctr_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userCtr = new user_ctr_1.default();
    const result = yield userCtr.transfer(req.headers.token, req.body);
    res.json(result).status(result.status);
}));
exports.default = router;

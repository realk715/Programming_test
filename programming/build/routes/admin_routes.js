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
const admin_ctr_1 = __importDefault(require("../ctr/admin_ctr"));
const auth_ctr_1 = __importDefault(require("../ctr/auth_ctr"));
const router = (0, express_1.Router)();
router.post('/addRate', auth_ctr_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminCtr = new admin_ctr_1.default();
    const result = yield adminCtr.addExchangeRate(req.headers.token, req.body);
    res.json(result).status(result.status);
}));
router.put('/addAdmin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminCtr = new admin_ctr_1.default();
    const result = yield adminCtr.changeUsertoAdmin(req.body);
    res.json(result).status(result.status);
}));
router.put('/editBalance', auth_ctr_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminCtr = new admin_ctr_1.default();
    const result = yield adminCtr.editBalance(req.headers.token, req.body);
    res.json(result).status(result.status);
}));
router.get('/get', auth_ctr_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminCtr = new admin_ctr_1.default();
    const result = yield adminCtr.getTotalBalance(req.headers.token);
    res.json(result).status(result.status);
}));
exports.default = router;

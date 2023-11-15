"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = __importDefault(require("./routes/user_routes"));
const admin_routes_1 = __importDefault(require("./routes/admin_routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/user', user_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.listen(process.env.PORT || 3000, () => {
    console.log('server listening on port 3000');
});

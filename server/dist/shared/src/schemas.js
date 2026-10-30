"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R4ActionSchema = exports.PathSchema = exports.JoinSchema = void 0;
const zod_1 = require("zod");
exports.JoinSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(20),
    token: zod_1.z.string().optional()
});
exports.PathSchema = zod_1.z.array(zod_1.z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT']));
exports.R4ActionSchema = zod_1.z.enum(['ALLOW', 'BLOCK']);
// Add more zod validation logic as needed

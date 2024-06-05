"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitUntil = void 0;
const waitUntil = async (ms, intervalFunc) => {
    return await new Promise(() => {
        intervalFunc();
    });
};
exports.waitUntil = waitUntil;

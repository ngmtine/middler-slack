"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
const wait = async (ms) => await new Promise((resolve) => setTimeout(resolve, ms));
exports.wait = wait;

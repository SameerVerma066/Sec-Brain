"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
const ALPHANUMERIC = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function random(length) {
    let ans = "";
    for (let i = 0; i < length; i += 1) {
        ans += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
    }
    return ans;
}
//# sourceMappingURL=utils.js.map
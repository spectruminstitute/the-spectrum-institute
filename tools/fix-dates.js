const fs = require("fs");
const p = "js/app.js";
let s = fs.readFileSync(p, "utf8");
const before = (s.match(/new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/g) || []).length;
s = s.split("new Date().toISOString().slice(0, 10)").join("getLocalDateISO()");
fs.writeFileSync(p, s);
console.log("replaced", before, "occurrences");

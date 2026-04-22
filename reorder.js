const fs = require('fs');
let code = fs.readFileSync('components/LandingPage.tsx', 'utf8');

const sBrowser = code.indexOf('{/* Browser compatibility strip */}');
const sNoFuss = code.indexOf('{/* No fuss strip */}');
const sWhyNot = code.indexOf('{/* Why not GTmetrix / DebugBear? */}');
const sCWV = code.indexOf('{/* What are Core Web Vitals? */}');
const sPricing = code.indexOf('{/* Pricing */}');

console.log({ sBrowser, sNoFuss, sWhyNot, sCWV, sPricing });

if (sNoFuss < sWhyNot && sWhyNot < sCWV && sCWV < sPricing) {
  const noFussToWhyNot = code.substring(sNoFuss, sCWV);
  code = code.substring(0, sNoFuss) + code.substring(sCWV, sPricing) + noFussToWhyNot + code.substring(sPricing);
  fs.writeFileSync('components/LandingPage.tsx', code);
  console.log("Rearranged successfully.");
} else {
  console.log("Indices are out of expected order.");
}

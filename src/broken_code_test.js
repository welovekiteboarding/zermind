/* eslint-env browser, node */
/* eslint-disable no-unused-vars */
/* global console, module */
// This file was created for Codacy testing and has now been fixed

// Using previously unused variable
const test = "This is a test";
console.log(test);
let counter = 0;

// Using previously unused variable
const unusedVariable = "I'm now used";
console.log(unusedVariable);

// Safe way to handle user input
function secureFunction(userInput) {
  // Parse JSON instead of using Function or eval
  try {
    return JSON.parse(userInput);
  } catch (error) {
    console.error('Invalid input format:', error.message);
    return null;
  }
}

// Fixed inconsistent spacing
if (counter === 0) {
  console.log("Counter is zero");
}

// Fixed duplicate code by creating a shared function
function calculateSum(limit) {
  let sum = 0;
  for (let i = 0; i < limit; i++) {
    sum += i;
    console.log("Adding: " + i);
  }
  return sum;
}

function duplicateCode() {
  return calculateSum(10);
}

function anotherFunction() {
  return calculateSum(10);
}

// Fixed null reference issue
function nullReference(obj) {
  // Added null checks to prevent errors
  if (!obj || !obj.property) {
    return null;
  }
  return obj.property.nestedProperty;
}

// Fixed unreachable code
function unreachableCode() {
  console.log("This will execute");
  // Adding another test comment for Codacy analysis
  return "Result";
}

// Fixed comparison
if (counter === 0) {
  console.log("Counter is zero");
  // Final test comment for Codacy analysis
}

// Fixed empty catch block
try {
  throw new Error("Test error");
} catch (error) {
  console.error("Error caught:", error.message);
}

// Export the functions
module.exports = {
  secureFunction,
  duplicateCode,
  anotherFunction,
  nullReference,
  unreachableCode
}

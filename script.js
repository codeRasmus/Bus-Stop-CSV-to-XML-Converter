const fs = require("fs");
const data = fs.readFileSync("Haltestellen.csv", "utf-8");

// Split file into rows and trim spaces
const rows = data.split("\n").map((row) => row.trim());
const headers = rows[0]; // First line is headers
const busRows = rows.slice(1); // Remaining rows are bus data

let headersArr = [0]; // Start at 0 to include first header

// Function to find semicolon indices in a row
function getIndex(string, char) {
  let arr = [0]; // Start at 0 to include first column
  for (let i = 0; i < string.length; i++) {
    if (string.charAt(i) === char) arr.push(i + 1); // +1 to start after ;
  }
  return arr;
}

// Get semicolon indices for headers
headersArr = getIndex(headers, ";");
console.log("Header Indices:", headersArr);

// Function to slice a row based on index array
function sliceRow(row, indexArr) {
  return indexArr.map((startIndex, i) => {
    const endIndex =
      indexArr[i + 1] !== undefined ? indexArr[i + 1] - 1 : row.length;
    return row.slice(startIndex, endIndex).trim(); // Trim whitespace
  });
}

// Slice headers
const headersResult = sliceRow(headers, headersArr);
console.log("Headers:", headersResult);

// Slice each bus row based on its own semicolon indices
const busData = busRows.map((row) => {
  const busArr = getIndex(row, ";"); // Each row has its own slicing structure
  return sliceRow(row, busArr);
});

// Ensure all rows have the same number of elements as headers
const maxColumns = headersArr.length;
const normalizedBusData = busData.map((row) => {
  while (row.length < maxColumns) row.push(""); // Add empty fields if missing
  return row;
});

normalizedBusData.forEach((row, index) => {
  console.log(`BusRow ${index + 1}:`, row);
});
console.log(
  "Number of elements in each bus row:",
  normalizedBusData.map((row) => row.length)
);

// Function to generate XML
function generateXML(headers, dataRows) {
  let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n<busstops>\n';

  dataRows.forEach((row) => {
    xml += `  <bus>\n`;
    headers.forEach((header, index) => {
      xml += `    <${header.replace(/\s+/g, "_")}>${
        row[index] || ""
      }</${header.replace(/\s+/g, "_")}>\n`;
    });
    xml += `  </bus>\n`;
  });

  xml += `</busstops>`;
  return xml;
}

// Generate XML and write to file
const xmlContent = generateXML(headersResult, normalizedBusData);
fs.writeFileSync("output.xml", xmlContent);

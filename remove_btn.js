const fs = require("fs");
const filePath =
  "c:\\Users\\BonnyMakaniankhondo\\Documents\\GitHub\\SyncUp\\client\\src\\pages\\AdminDashboard.jsx";
let content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");
let foundIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('label: "View Profile"')) {
    foundIdx = i;
    break;
  }
}
if (foundIdx !== -1) {
  // Assuming 2 lines before and 3 lines after based on view_file
  // 558: {
  // 559: icon: <Eye size={14} />, (line foundIdx - 1)
  // 560: label: "View Profile", (line foundIdx)
  // 561: onClick: () => (line foundIdx + 1)
  // 562: navigate(`/profile/${user.id}`), (line foundIdx + 2)
  // 563: }, (line foundIdx + 3)
  lines.splice(foundIdx - 2, 6);
  fs.writeFileSync(filePath, lines.join("\n"));
  console.log(
    "Removed View Profile from lines " +
      (foundIdx - 1) +
      " to " +
      (foundIdx + 4),
  );
} else {
  console.log("Not found");
}

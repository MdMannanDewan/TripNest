function buildFolderPath(type, id, category) {
  switch (type) {
    case "user":
      return `uploads/users/${id}/${category || ""}`;
    case "listing":
      return `uploads/listings/${id}/${category || ""}`;
    default:
      return "uploads/misc";
  }
}
module.exports = { buildFolderPath };

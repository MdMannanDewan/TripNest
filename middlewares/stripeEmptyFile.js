function stripeEmptyFile(req, res, next) {
  // Single file (upload.single())
  if (req.file && req.file.buffer && req.file.buffer.length === 0)
    req.file = undefined;
  // Multiple file (upload.array())
  if (req.files && Array.isArray(req.files)) {
    req.files = req.files.filter((f) => f.buffer && f.buffer.length > 0);
    if (req.files.length === 0) req.files = undefined;
  }
  // Multiple fields (upload.fields)
  if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
    Object.keys(req.files).forEach((field) => {
      req.files[field] = req.files[field].filter(
        (f) => f.buffer && f.buffer.length > 0
      );
      if (req.files[field].length === 0) delete req.files[field];
    });
    if (Object.keys(req.files).length === 0) {
      req.files === undefined;
    }
  }
  next();
}

module.exports = { stripeEmptyFile };

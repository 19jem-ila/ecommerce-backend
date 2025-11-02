
  export const parseProductData = (req, res, next) => {
    // Convert colors from string to array
    if (req.body.colors) {
      if (typeof req.body.colors === "string") {
        try {
          // Try parsing JSON first
          req.body.colors = JSON.parse(req.body.colors);
        } catch {
          // Fallback: split by commas
          req.body.colors = req.body.colors.split(",").map(c => c.trim());
        }
      }
    }
    
  
    // Convert uploaded files to image URLs (temporary before Cloudinary)
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }
  
    console.log("Parsed colors:", req.body.colors); // debug
    console.log("Parsed images:", req.body.images); // debug
    next();
  };
  
import { body } from "express-validator";

export const productValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 })
    .withMessage("Product name cannot exceed 100 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["eyeglasses", "sunglasses", "lenses", "brands", "sports"])
    .withMessage("Invalid category"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("colors")
    .isArray({ min: 1 })
    .withMessage("At least one color is required")
    .custom((arr) => arr.every((c) => typeof c === "string"))
    .withMessage("Colors must be strings"),

  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one product image is required")
    .custom((arr) => arr.every((url) => typeof url === "string"))
    .withMessage("Images must be an array of strings (URLs)"),

  body("prescriptionEligible")
    .optional()
    .isBoolean()
    .withMessage("prescriptionEligible must be true or false"),

  body("includeLenses")
    .optional()
    .isBoolean()
    .withMessage("includeLenses must be true or false"),

  body("brand")
    .optional()
    .isString()
    .withMessage("Brand must be a string"),

  body("frameMaterial")
    .optional()
    .isIn(["Metal", "Plastic", "Titanium"])
    .withMessage("Invalid frame material"),

  body("lensType")
    .optional()
    .isIn(["Standard", "Polarized", "Photochromic"])
    .withMessage("Invalid lens type"),

  body("inStock")
    .optional()
    .isBoolean()
    .withMessage("inStock must be true or false"),

  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("reviewCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Review count must be a non-negative integer"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
];

export const productUpdateValidationRules = [
  body("name").optional().isString(),
  body("category").optional().isIn(["eyeglasses", "sunglasses", "lenses", "sports", "brands"]),
  body("price").optional().isFloat({ min: 0 }),
  body("colors").optional().isArray(),
  body("images").optional().isArray(),
  body("brand").optional().isString(),
  body("frameMaterial").optional().isIn(["Metal", "Plastic", "Titanium"]),
  body("lensType").optional().isIn(["Standard", "Polarized", "Photochromic"]),
  body("inStock").optional().isBoolean(),
  body("stockQuantity").optional().isInt({ min: 0 }),
  body("rating").optional().isFloat({ min: 0, max: 5 }),
  body("reviewCount").optional().isInt({ min: 0 }),
  body("description").optional().isString(),
  body("prescriptionEligible").optional().isBoolean(),
  body("includeLenses").optional().isBoolean()
];

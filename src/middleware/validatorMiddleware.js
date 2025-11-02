export const validate = (schema) => { 
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
  
      if (error) {
        // Log all validation errors to the console
        console.log("❌ Joi validation failed:", error.details.map((err) => err.message));
  
        return res.status(400).json({
          success: false,
          errors: error.details.map((err) => err.message), // return all validation errors
        });
      }
      
      next();
    };
  };
  
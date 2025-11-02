import Joi from "joi"

export const registerSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } }) // valid email format
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),
  
    password: Joi.string()
      .min(8)
      .max(64)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).*$"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot be longer than 64 characters",
        "string.pattern.base":
          "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        "any.required": "Password is required",
      }),
  
    displayName: Joi.string()
      .min(3)
      .max(30)
      .optional()
      .messages({
        "string.min": "Display name must be at least 3 characters",
        "string.max": "Display name cannot be more than 30 characters",
      }),
      termsAccepted: Joi.boolean()
    .valid(true) // must be true
    .required()
    .messages({
      "any.only": "You must accept the terms and privacy policy",
      "any.required": "Terms and policy acceptance is required",
    }),
  });

  export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),
  });

  export const resetPasswordSchema = Joi.object({
    oobCode: Joi.string().required().messages({
      "any.required": "Reset code is required",
    }),
  
    newPassword: Joi.string()
      .min(8)
      .max(64)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot be longer than 64 characters",
        "string.pattern.base":
          "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        "any.required": "New password is required",
      }),
  
    confirmPassword: Joi.valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
      }),
  });
  
  export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
      "any.required": "Old password is required",
    }),
  
    newPassword: Joi.string()
      .min(8)
      .max(64)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot be longer than 64 characters",
        "string.pattern.base":
          "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        "any.required": "New password is required",
      }),
  
    confirmPassword: Joi.valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
      }),
  });

  export const loginUserSchema = Joi.object({
   idToken: Joi.string().required()
  });
  
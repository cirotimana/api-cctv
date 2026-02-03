const zod = require("zod");

const createUserSchema = zod.object({
  email: zod
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email",
    }),
  password: zod
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters",
    })
    .max(255, {
      message: "Password must be at most 255 characters",
    }),
  profile_image: zod.string().optional(),
  username: zod
    .string({
      required_error: "Username is required",
    })
    .min(2, {
      message: "Username must be at least 2 characters",
    })
    .max(255, {
      message: "Username must be at most 255 characters",
    }),
  is_active: zod.boolean().optional(),
});

const updateUserSchema = zod
  .object({
    email: zod
      .string({
        required_error: "Email is required",
      })
      .email({
        message: "Invalid email",
      }),
    password: zod
      .string()
      .min(6, {
        message: "Password must be at least 6 characters",
      })
      .max(255, {
        message: "Password must be at most 255 characters",
      })
      .optional()
      .or(zod.literal('')),
    confirmPassword: zod
      .string()
      .min(6, {
        message: "Password must be at least 6 characters",
      })
      .max(255, {
        message: "Password must be at most 255 characters",
      })
      .optional()
      .or(zod.literal('')),
    profile_image: zod.string().optional(),
    username: zod
      .string()
      .min(2, {
        message: "Username must be at least 2 characters",
      })
      .max(255, {
        message: "Username must be at most 255 characters",
      }),
    is_active: zod.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

module.exports = { createUserSchema, updateUserSchema };

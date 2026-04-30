import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const projectValidators = {
  create: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("description")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Description must be less than 2000 characters"),
    body("owner_id")
      .notEmpty()
      .withMessage("owner_id is required")
      .isInt({ min: 1 })
      .withMessage("owner_id must be a positive integer"),
    body("visibility")
      .optional()
      .isIn(["public", "seeking"])
      .withMessage("visibility must be 'public' or 'seeking'"),
    validate,
  ],

  updateStatus: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Project ID must be a positive integer"),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["planned", "active", "completed", "archived"])
      .withMessage(
        "Status must be one of: planned, active, completed, archived",
      ),
    validate,
  ],

  joinRequest: [
    param("projectId")
      .isInt({ min: 1 })
      .withMessage("Project ID must be a positive integer"),
    body("user_id")
      .notEmpty()
      .withMessage("user_id is required")
      .isInt({ min: 1 })
      .withMessage("user_id must be a positive integer"),
    validate,
  ],

  addMember: [
    param("projectId")
      .isInt({ min: 1 })
      .withMessage("Project ID must be a positive integer"),
    body("user_id")
      .notEmpty()
      .withMessage("user_id is required")
      .isInt({ min: 1 })
      .withMessage("user_id must be a positive integer"),
    body("role")
      .optional()
      .isIn(["member", "contributor", "lead"])
      .withMessage("Role must be one of: member, contributor, lead"),
    validate,
  ],

  attachSkills: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Project ID must be a positive integer"),
    body("skill_ids")
      .isArray({ min: 1 })
      .withMessage("skill_ids must be a non-empty array")
      .custom((value) => value.every((id) => typeof id === "number"))
      .withMessage("All skill_ids must be integers"),
    validate,
  ],
};

export const progressValidators = {
  create: [
    body("project_id")
      .notEmpty()
      .withMessage("project_id is required")
      .isInt({ min: 1 })
      .withMessage("project_id must be a positive integer"),
    body("user_id")
      .notEmpty()
      .withMessage("user_id is required")
      .isInt({ min: 1 })
      .withMessage("user_id must be a positive integer"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ max: 5000 })
      .withMessage("Content must be less than 5000 characters"),
    body("signal_type")
      .optional()
      .isIn(["learned", "applied", "taught"])
      .withMessage("signal_type must be one of: learned, applied, taught"),
    body("skill_ids")
      .optional()
      .isArray()
      .withMessage("skill_ids must be an array"),
    validate,
  ],

  update: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Update ID must be a positive integer"),
    body("content")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Content must be less than 5000 characters"),
    validate,
  ],

  delete: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Update ID must be a positive integer"),
    validate,
  ],
};

export const mentorshipValidators = {
  createSession: [
    body("mentor_id")
      .notEmpty()
      .withMessage("mentor_id is required")
      .isInt({ min: 1 })
      .withMessage("mentor_id must be a positive integer"),
    body("intern_id")
      .notEmpty()
      .withMessage("intern_id is required")
      .isInt({ min: 1 })
      .withMessage("intern_id must be a positive integer"),
    body("session_date")
      .notEmpty()
      .withMessage("session_date is required")
      .isISO8601()
      .withMessage("session_date must be a valid ISO 8601 date"),
    body("session_focus").notEmpty().withMessage("session_focus is required"),
    body("topic")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Topic must be less than 500 characters"),
    validate,
  ],

  updateSession: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Session ID must be a positive integer"),
    body("status")
      .optional()
      .isIn(["pending", "accepted", "declined", "completed", "cancelled"])
      .withMessage("Invalid status"),
    body("scheduled_at")
      .optional()
      .isISO8601()
      .withMessage("scheduled_at must be a valid ISO 8601 date"),
    validate,
  ],
};

export const userValidators = {
  getProfile: [
    param("userId")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),
    validate,
  ],

  getActivityTimeline: [
    param("userId")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a non-negative integer"),
    validate,
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required")
      .isLength({ min: 1 })
      .withMessage("Current password cannot be empty"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8, max: 100 })
      .withMessage("Password must be between 8 and 100 characters"),
    validate,
  ],

  updateProfile: [
    param("userId")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Name must be less than 100 characters"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must be less than 500 characters"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("role")
      .optional()
      .isIn(["intern", "mentor", "resident", "alumni", "admin"])
      .withMessage("Invalid role"),
    body("has_commenced")
      .optional()
      .isBoolean()
      .withMessage("has_commenced must be a boolean"),
    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("is_active must be a boolean"),
    body("cycle")
      .optional({ nullable: true })
      .isLength({ max: 10 })
      .withMessage("Cycle must be 10 characters or fewer"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes must be less than 1000 characters"),
    validate,
  ],
};

export const chatValidators = {
  sendMessage: [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Message content is required")
      .isLength({ max: 5000 })
      .withMessage("Message must be less than 5000 characters"),
    body("channel_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Channel ID must be a positive integer"),
    body("recipient_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Recipient ID must be a positive integer"),
    validate,
  ],

  createChannel: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Channel name is required")
      .isLength({ max: 100 })
      .withMessage("Channel name must be less than 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    validate,
  ],
};

export const notificationValidators = {
  markRead: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Notification ID must be a positive integer"),
    validate,
  ],
};

export const uploadValidators = {
  avatar: [
    body("user_id")
      .notEmpty()
      .withMessage("User ID is required")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),
    validate,
  ],
};

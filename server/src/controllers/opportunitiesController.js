import pool from "../config/db.js";
import { createSmartNotification } from "../services/notificationService.js";

const CAN_VIEW = ["resident", "alumni"];
const CAN_POST = ["alumni"];
const OPPORTUNITY_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "apprenticeship",
  "scholarship",
  "event",
];

async function getUserById(userId) {
  if (!userId) return null;
  const [rows] = await pool.query(
    "SELECT id, name, role, cycle, is_admin FROM users WHERE id = ?",
    [userId],
  );
  return rows[0] || null;
}

function getRequesterId(req) {
  return req.user?.id || req.query.user_id || req.body.user_id || req.body.author_id;
}

function normalizeUrl(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }
    return trimmed;
  } catch {
    const error = new Error("Apply URL must be a valid http(s) URL");
    error.statusCode = 400;
    throw error;
  }
}

async function notifyOpportunityAudience(opportunity, author) {
  try {
    const [recipients] = await pool.query(
      `SELECT id
       FROM users
       WHERE id != ?
         AND (is_active IS NULL OR is_active != FALSE)
         AND role IN ('resident', 'alumni')`,
      [author.id],
    );

    for (const recipient of recipients) {
      await createSmartNotification({
        userId: recipient.id,
        type: "opportunity",
        title: "New community opportunity",
        message: `${opportunity.title} at ${opportunity.company}`,
        link: "/opportunities",
        relatedId: opportunity.id,
        relatedType: "opportunity",
        groupKey: `opportunity:${opportunity.id}`,
        preferenceKey: "opportunity",
      });
    }
  } catch (err) {
    console.error("Failed to send opportunity notifications:", err);
  }
}

export const getOpportunities = async (req, res) => {
  try {
    const requester = await getUserById(getRequesterId(req));
    if (!requester || (!CAN_VIEW.includes(requester.role) && !requester.is_admin)) {
      return res.status(403).json({ error: "Community access required" });
    }

    const [rows] = await pool.query(`
      SELECT
        o.id,
        o.author_id,
        o.title,
        o.company,
        o.type,
        o.description,
        o.apply_url,
        o.is_active,
        o.created_at,
        o.updated_at,
        u.name AS author_name,
        u.role AS author_role,
        u.cycle AS author_cycle
      FROM opportunities o
      JOIN users u ON u.id = o.author_id
      WHERE o.is_active = TRUE
      ORDER BY o.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching opportunities:", err);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
};

export const createOpportunity = async (req, res) => {
  const {
    author_id,
    title,
    company,
    type = "full_time",
    description,
    apply_url,
  } = req.body;

  try {
    const author = await getUserById(req.user?.id || author_id);
    if (!author || (!CAN_POST.includes(author.role) && !author.is_admin)) {
      return res.status(403).json({
        error: "Only alumni and admins can post opportunities right now",
      });
    }

    const cleanTitle = String(title || "").trim();
    const cleanCompany = String(company || "").trim();
    const cleanType = OPPORTUNITY_TYPES.includes(type) ? type : "full_time";
    const cleanDescription = String(description || "").trim();

    if (!cleanTitle || !cleanCompany) {
      return res.status(400).json({ error: "Title and company are required" });
    }

    const [result] = await pool.query(
      `
        INSERT INTO opportunities
          (author_id, title, company, type, description, apply_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        author.id,
        cleanTitle.slice(0, 200),
        cleanCompany.slice(0, 200),
        cleanType,
        cleanDescription ? cleanDescription.slice(0, 500) : null,
        normalizeUrl(apply_url),
      ],
    );

    const [rows] = await pool.query(
      `
        SELECT
          o.*,
          u.name AS author_name,
          u.role AS author_role,
          u.cycle AS author_cycle
        FROM opportunities o
        JOIN users u ON u.id = o.author_id
        WHERE o.id = ?
      `,
      [result.insertId],
    );

    const opportunity = rows[0];
    await notifyOpportunityAudience(opportunity, author);

    res.status(201).json(opportunity);
  } catch (err) {
    console.error("Error creating opportunity:", err);
    res
      .status(err.statusCode || 500)
      .json({ error: err.message || "Failed to create opportunity" });
  }
};

export const deleteOpportunity = async (req, res) => {
  const { id } = req.params;

  try {
    const requester = await getUserById(getRequesterId(req));
    if (!requester) {
      return res.status(403).json({ error: "User access required" });
    }

    const [rows] = await pool.query(
      "SELECT id, author_id FROM opportunities WHERE id = ? AND is_active = TRUE",
      [id],
    );
    const opportunity = rows[0];
    if (!opportunity) return res.status(404).json({ error: "Not found" });

    const canDelete =
      requester.is_admin || Number(opportunity.author_id) === requester.id;
    if (!canDelete) return res.status(403).json({ error: "Not authorized" });

    await pool.query(
      "UPDATE opportunities SET is_active = FALSE WHERE id = ?",
      [id],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting opportunity:", err);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
};

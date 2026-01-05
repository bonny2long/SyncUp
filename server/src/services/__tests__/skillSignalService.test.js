import { test, describe } from "node:test";
import assert from "node:assert/strict";
import pool from "../../config/db.js";
import { emitSkillSignals } from "../skillSignalService.js";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

// Use a REAL user ID that exists in your DB
// You confirmed this one exists
const TEST_USER_ID = 1;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function countSignals(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM user_skill_signals WHERE user_id = ?`,
    [userId]
  );
  return rows[0].count;
}

async function clearSignals(userId) {
  await pool.query(`DELETE FROM user_skill_signals WHERE user_id = ?`, [
    userId,
  ]);
}

async function createTestSkill() {
  const skillName = `__test_skill_${Date.now()}`;
  const [result] = await pool.query(
    `
    INSERT INTO skills (skill_name, category)
    VALUES (?, 'backend')
    `,
    [skillName]
  );
  return result.insertId;
}

async function deleteTestSkill(skillId) {
  await pool.query(`DELETE FROM skills WHERE id = ?`, [skillId]);
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("emitSkillSignals guardrails", () => {
  test("mentorship career guidance emits no skills", async () => {
    await clearSignals(TEST_USER_ID);

    await emitSkillSignals({
      userId: TEST_USER_ID,
      sourceType: "mentorship",
      sourceId: 1,
      signalType: "completed",
      context: { session_focus: "career_guidance" },
    });

    const count = await countSignals(TEST_USER_ID);
    assert.equal(count, 0);
  });

  test("progress update emits skill signals", async () => {
    const skillId = await createTestSkill();

    await clearSignals(TEST_USER_ID);

    await emitSkillSignals({
      userId: TEST_USER_ID,
      sourceType: "update",
      sourceId: 10,
      signalType: "update",
      skillIds: [skillId],
      weight: 1,
    });

    const count = await countSignals(TEST_USER_ID);
    assert.equal(count, 1);

    await deleteTestSkill(skillId);
  });

  test("project join emits skill signals", async () => {
    const skillId = await createTestSkill();

    await clearSignals(TEST_USER_ID);

    await emitSkillSignals({
      userId: TEST_USER_ID,
      sourceType: "project",
      sourceId: 5,
      signalType: "joined",
      skillIds: [skillId],
      weight: 1,
    });

    const count = await countSignals(TEST_USER_ID);
    assert.equal(count, 1);

    await deleteTestSkill(skillId);
  });
});

// ─────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────

afterAll(async () => {
  await pool.end();
});

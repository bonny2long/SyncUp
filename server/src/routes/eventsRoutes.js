import express from "express";
import {
  getEvents,
  createEvent,
  rsvpEvent,
  deleteEvent,
} from "../controllers/eventsController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.post("/:id/rsvp", rsvpEvent);
router.delete("/:id", deleteEvent);

export default router;

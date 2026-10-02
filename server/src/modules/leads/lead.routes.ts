import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import * as ctrl from "./lead.controller.js";
import {
  createLeadSchema,
  createNoteSchema,
  idParamSchema,
  listLeadsQuerySchema,
  updateLeadSchema,
  updateStatusSchema,
} from "./lead.schema.js";

export const leadRouter = Router();

leadRouter.get("/", validate({ query: listLeadsQuerySchema }), ctrl.list);
leadRouter.post("/", validate({ body: createLeadSchema }), ctrl.create);

leadRouter.get("/:id", validate({ params: idParamSchema }), ctrl.getById);
leadRouter.patch("/:id", validate({ params: idParamSchema, body: updateLeadSchema }), ctrl.update);
leadRouter.delete("/:id", validate({ params: idParamSchema }), ctrl.remove);

leadRouter.patch("/:id/status", validate({ params: idParamSchema, body: updateStatusSchema }), ctrl.updateStatus);
leadRouter.post("/:id/notes", validate({ params: idParamSchema, body: createNoteSchema }), ctrl.addNote);

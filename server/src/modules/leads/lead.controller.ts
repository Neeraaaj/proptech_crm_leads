import type { Request, Response } from "express";
import * as service from "./lead.service.js";
import type { ListLeadsQuery } from "./lead.schema.js";

/**
 * Controllers are thin: read validated input → call service → shape the response.
 * Response envelope: { data, meta? } on success.
 */

type IdParams = { id: string };

export async function create(req: Request, res: Response) {
  const lead = await service.createLead(req.body);
  res.status(201).json({ data: lead });
}

export async function list(_req: Request, res: Response) {
  const query = res.locals.query as ListLeadsQuery;
  const { items, meta } = await service.listLeads(query);
  res.json({ data: items, meta });
}

export async function getById(req: Request<IdParams>, res: Response) {
  const lead = await service.getLeadById(req.params.id);
  res.json({ data: lead });
}

export async function update(req: Request<IdParams>, res: Response) {
  const lead = await service.updateLead(req.params.id, req.body);
  res.json({ data: lead });
}

export async function updateStatus(req: Request<IdParams>, res: Response) {
  const lead = await service.updateLeadStatus(req.params.id, req.body.status);
  res.json({ data: lead });
}

export async function remove(req: Request<IdParams>, res: Response) {
  await service.deleteLead(req.params.id);
  res.status(204).end();
}

export async function addNote(req: Request<IdParams>, res: Response) {
  const note = await service.addNote(req.params.id, req.body.content);
  res.status(201).json({ data: note });
}

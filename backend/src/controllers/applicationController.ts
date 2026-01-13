import { Request, Response } from "express";
import { Application } from "../models/Application";

export async function createApplication(req: Request, res: Response) {
  try {
    const payload = req.body;
    const a = await Application.create(payload);
    return res.status(201).json(a);
  } catch (err) {
    return res.status(500).json({ error: "failed to create application", details: err });
  }
}

export async function listApplications(req: Request, res: Response) {
  try {
    const q: any = {};
    if (req.query.jobId) q.jobId = req.query.jobId;
    const items = await Application.find(q).limit(100).lean();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: "failed to list applications", details: err });
  }
}

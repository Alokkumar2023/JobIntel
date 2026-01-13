import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Company } from "../models/Company";
import { Revenue } from "../models/Revenue";

// AI Job Parser - Parse raw job text and extract structured data
export async function parseJobText(req: Request, res: Response) {
  try {
    console.log("parseJobText endpoint called");
    const { rawText } = req.body;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: "Please provide job text to parse" });
    }

    const lines = rawText.split("\n").map(line => line.trim());
    const fullText = rawText.toLowerCase();

    // Extract Company
    const companyMatch = rawText.match(/(?:Company|🏢)\s*[:\-]?\s*([^\n]+)/i);
    const company = companyMatch ? companyMatch[1].trim() : "Company Name";

    // Extract Job Title
    const titleMatch = rawText.match(/(?:Role|Position|Job Title|👨‍💻)\s*[:\-]?\s*([^\n]+)/i);
    let title = titleMatch ? titleMatch[1].trim() : "Job Title";
    title = title.replace(/[🚀📍💰🎓🛠️👨‍💻🏢]/g, "").trim();

    // Extract Location
    const locationMatch = rawText.match(/(?:Location|📍|Based in)\s*[:\-]?\s*([^\n]+)/i);
    let location = locationMatch ? locationMatch[1].trim() : "Bangalore, India";
    location = location.replace(/[📍]/g, "").trim();

    const isRemote = fullText.includes("remote") || fullText.includes("work from home") || fullText.includes("wfh");

    // Extract Salary/Stipend
    const salaryMatch = rawText.match(/(?:Salary|Stipend|CTC|Pay|💰)\s*[:\-]?\s*([^\n]+)/i);
    const salaryText = salaryMatch ? salaryMatch[1].trim().replace(/[💰]/g, "").trim() : "";

    let salary = "";
    let stipend = "";

    if (salaryText.toLowerCase().includes("stipend") || salaryText.includes("LPA") || salaryText.includes("₹")) {
      stipend = salaryText;
    } else if (salaryText) {
      salary = salaryText;
    }

    // Extract Tech Stack
    const TECH_KEYWORDS = [
      "React", "Vue", "Angular", "Node.js", "Python", "Java", "C++", "Go",
      "TypeScript", "JavaScript", "PHP", "Ruby", "Rust", "Kotlin", "Swift",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "MongoDB", "PostgreSQL",
      "MySQL", "Redis", "Elasticsearch", "GraphQL", "REST", "Django", "Flask",
      "Spring", "Express", "Next.js", "Gatsby", "WebSocket", "MQTT", "gRPC"
    ];

    const techStack: string[] = [];
    TECH_KEYWORDS.forEach(tech => {
      if (fullText.includes(tech.toLowerCase())) {
        techStack.push(tech);
      }
    });

    // Extract Experience
    const expMatch = rawText.match(/(?:Experience|🎖️|Experience Level)\s*[:\-]?\s*([^\n]+)/i);
    const experience = expMatch ? expMatch[1].trim().replace(/[🎖️]/g, "").trim() : "Not specified";

    // Extract Eligibility
    const eligMatch = rawText.match(/(?:Eligibility|Qualifications|Requirements|🎓)\s*[:\-]?\s*([^\n]+)/i);
    const eligibility = eligMatch ? eligMatch[1].trim().replace(/[🎓]/g, "").trim() : "Graduates";

    // Extract Batch info
    const batchMatch = rawText.match(/(?:BATCH|Batch|Year)\s+(\d{4})\s*(?:\||and|&)?\s*(\d{4})?/i);
    const batch: string[] = [];
    if (batchMatch) {
      batch.push(batchMatch[1]);
      if (batchMatch[2]) batch.push(batchMatch[2]);
    }

    // Generate tags
    const tags: string[] = [];

    if (experience.toLowerCase().includes("fresher") || experience.toLowerCase().includes("0-1")) {
      tags.push("Fresher");
    }
    if (experience.toLowerCase().includes("junior") || experience.toLowerCase().includes("1-3")) {
      tags.push("Entry-level");
    }
    if (experience.toLowerCase().includes("senior")) {
      tags.push("Senior");
    }

    tags.push("Internship");

    if (isRemote) {
      tags.push("Remote");
    } else {
      tags.push("On-site");
    }

    // Generate description from raw text
    const description = rawText.substring(0, 500) + (rawText.length > 500 ? "..." : "");

    return res.json({
      title,
      company,
      description,
      location,
      isRemote,
      salary: salary || undefined,
      stipend: stipend || undefined,
      techStack: [...new Set(techStack)],
      tags: [...new Set(tags)],
      eligibility: eligibility || undefined,
      experience: experience || undefined,
      batch: batch.length > 0 ? batch : undefined,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to parse job text", details: err });
  }
}
export async function createJob(req: Request, res: Response) {
  try {
    const { title, companyId, rawHtml, status, meta, description, location, isRemote, techStack, tags, eligibility, experience, batch, company, salary, stipend, rawText } = req.body;
    
    // If company name is provided, create/get company
    let companyDocId = companyId;
    if (company && !companyId) {
      const companyDoc = await Company.findOneAndUpdate(
        { name: company },
        { $set: { name: company } },
        { upsert: true, new: true }
      );
      companyDocId = companyDoc._id;
    }

    const job = await Job.create({
      title,
      companyId: companyDocId,
      rawHtml: rawText || rawHtml,
      description,
      location,
      status: status || "draft",
      meta: {
        ...meta,
        isRemote,
        techStack,
        tags,
        eligibility,
        experience,
        batch,
        salary,
        stipend,
      },
    });

    // Create revenue record for job posting
    try {
      await Revenue.create({
        jobId: job._id,
        companyId: companyDocId,
        amount: 500, // Default ₹500 per job posting
        currency: 'INR',
        type: 'job_posting',
        status: 'completed',
        description: `Job posting: ${title}`,
        metadata: { jobTitle: title, postedDate: new Date() }
      });
    } catch (revenueErr) {
      console.error('Failed to create revenue record:', revenueErr);
    }

    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ error: "failed to create job", details: err });
  }
}

// Get job by id
export async function getJob(req: Request, res: Response) {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ error: "not found" });
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: "failed to get job", details: err });
  }
}

// Update job
export async function updateJob(req: Request, res: Response) {
  try {
    const updates = req.body;
    const job = await Job.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean();
    if (!job) return res.status(404).json({ error: "not found" });
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: "failed to update job", details: err });
  }
}

// Delete job
export async function deleteJob(req: Request, res: Response) {
  try {
    const job = await Job.findByIdAndDelete(req.params.id).lean();
    if (!job) return res.status(404).json({ error: "not found" });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "failed to delete job", details: err });
  }
}

// List jobs (simple)
export async function listJobs(req: Request, res: Response) {
  try {
    const q: any = {};
    if (req.query.status) q.status = req.query.status;
    const jobs = await Job.find(q).limit(100).lean();
    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ error: "failed to list jobs", details: err });
  }
}

// Simple ingestion endpoint: accept url/rawHtml and create company/job
export async function ingestJob(req: Request, res: Response) {
  try {
    const { url, rawHtml, company } = req.body;

    // naive parser stub: extract title from rawHtml <title> or from payload
    let title = req.body.title;
    if (!title && rawHtml) {
      const m = /<title>([^<]+)<\/title>/i.exec(rawHtml);
      if (m) title = m[1].trim();
    }

    // upsert company
    let companyDoc = null;
    if (company && company.name) {
      companyDoc = await Company.findOneAndUpdate({ name: company.name }, { $set: company }, { upsert: true, new: true });
    }

    const job = await Job.create({ title: title || "Untitled Job", companyId: companyDoc?._id, rawHtml: rawHtml || "", meta: { sourceUrl: url } });
    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ error: "ingest failed", details: err });
  }
}

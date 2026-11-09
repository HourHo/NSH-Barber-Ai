import express from "express";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static("public"));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 12 }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(allowed.includes(file.mimetype) ? null : new Error("សូមប្រើរូប JPG, PNG ឬ WEBP"), allowed.includes(file.mimetype));
  }
});

app.post("/api/analyze", upload.single("photo"), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "មិនទាន់កំណត់ OPENAI_API_KEY នៅលើ Server ទេ។" });
    }
    if (!req.file) return res.status(400).json({ error: "សូមបញ្ចូលរូបថតភ្ញៀវ។" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const mime = req.file.mimetype;
    const imageData = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    const hairType = String(req.body.hairType || "មិនបានបញ្ជាក់").slice(0, 80);
    const length = String(req.body.length || "មិនបានបញ្ជាក់").slice(0, 80);
    const styleGoal = String(req.body.styleGoal || "មិនបានបញ្ជាក់").slice(0, 120);
    const colorGoal = String(req.body.colorGoal || "មិនបានបញ្ជាក់").slice(0, 120);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: `អ្នកជាអ្នកប្រឹក្សាម៉ូដសក់អាជីពសម្រាប់ NSH BARBER នៅកម្ពុជា។ វិភាគរូបថតដោយប្រុងប្រយ័ត្ន។ កុំសន្និដ្ឋានអំពីអត្តសញ្ញាណ អាយុ សុខភាព ឬលក្ខណៈរសើប។ ការវាយតម្លៃទម្រង់មុខ/សក់គ្រាន់តែជាការណែនាំ មិនមែនការវាស់វែងវេជ្ជសាស្ត្រ។ បើរូបមិនច្បាស់ សូមប្រាប់ថាត្រូវការរូបថ្មី។ ឆ្លើយជាភាសាខ្មែរ មានចំណងជើងច្បាស់ និងចំណុចខ្លីៗ។ ផ្តល់៖ ទម្រង់មុខដែលអាចមើលឃើញ, សភាព/ប្រភេទសក់ដែលអាចមើលឃើញ, 3 ម៉ូដកាត់សក់សមស្រប (រួមទាំង fade/guard ឬប្រវែងណែនាំបើអាច), ការណែនាំ styling និងការថែទាំ, ពណ៌សក់ដែលអាចសាកល្បង។ កុំអះអាងថាអាចឃើញទម្រង់ក្បាលក្រោយ ប្រសិនបើរូបមិនបង្ហាញ។`,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: `សូមវិភាគរូបនេះសម្រាប់ការប្រឹក្សាម៉ូដសក់។ ព័ត៌មានពីអតិថិជន៖ ប្រភេទសក់=${hairType}; ប្រវែង=${length}; ស្ទាយចង់បាន=${styleGoal}; ពណ៌ចង់បាន=${colorGoal}. សូមបញ្ជាក់កម្រិតភាពប្រាកដប្រជា និងសួរឱ្យជាងពិនិត្យជាមួយភ្ញៀវមុនកាត់។` },
          { type: "input_image", image_url: imageData, detail: "auto" }
        ]
      }]
    });

    res.json({ analysis: response.output_text || "មិនអាចទទួលបានលទ្ធផលទេ។ សូមសាកល្បងម្ដងទៀត។" });
  } catch (err) {
    console.error("Analyze error:", err?.message || err);
    const status = err?.status === 429 ? 429 : 500;
    res.status(status).json({ error: status === 429 ? "API មានការកំណត់ ឬមិនមានឥណទានគ្រប់គ្រាន់។ សូមពិនិត្យ Billing។" : "មានបញ្ហាក្នុងការវិភាគ។ សូមពិនិត្យការកំណត់ Server ហើយសាកម្ដងទៀត។" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "NSH BARBER AI" }));

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "រូបថតធំពេក។ សូមជ្រើសរូបក្រោម 8MB។" });
  }
  res.status(400).json({ error: err.message || "សំណើមិនត្រឹមត្រូវ។" });
});

app.listen(port, () => console.log(`NSH BARBER AI running on port ${port}`));

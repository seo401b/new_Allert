const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const { analyzeFullImage } = require("./utils/analyzeUtils");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));

// 파일 업로드 설정 (5MB 제한)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("이미지 파일만 업로드할 수 있습니다."));
    }
    cb(null, true);
  },
});

app.get("/", (req, res) => {
  res.send("Allert 백엔드가 실행 중입니다.");
});

// 이미지 분석 API
app.post("/analyze-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "이미지 파일이 필요합니다." });
  }

  const imagePath = req.file.path;
  const excelPath = path.join(__dirname, "DB/all_data.xlsx");

  try {
    const result = await analyzeFullImage(imagePath, excelPath);
    fs.unlinkSync(imagePath);
    res.json(result);
  } catch (err) {
    console.error("❌ 분석 실패:", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ✅ multer 에러 핸들러 (용량 초과 등)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "파일 용량이 너무 큽니다. 5MB 이하로 업로드해 주세요." });
  } else if (err.message === "이미지 파일만 업로드할 수 있습니다.") {
    return res.status(400).json({ error: err.message });
  }

  console.error("❌ 미처리 에러:", err);
  res.status(500).json({ error: "예기치 못한 서버 오류가 발생했습니다." });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

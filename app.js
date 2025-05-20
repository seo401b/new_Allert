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

// uploads 디렉토리 보장
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// CORS 설정 (개발용은 *, 배포 시 특정 도메인만 허용)
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://your-frontend.com"]  // 배포 도메인
    : "*"
}));

app.use(bodyParser.json({ limit: "50mb" }));

// 파일 업로드 설정 (5MB 제한 + 이미지 필터링)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("이미지 파일만 업로드할 수 있습니다."));
    }
    cb(null, true);
  },
});

app.get("/", (req, res) => {
  res.send("✅ Allert 백엔드가 실행 중입니다.");
});

// 이미지 분석 API
app.post("/analyze-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "이미지 파일이 필요합니다.",
    });
  }

  const imagePath = req.file.path;
  const excelPath = path.join(__dirname, "DB/all_data.xlsx");

  try {
    const result = await analyzeFullImage(imagePath, excelPath);

    // 업로드된 이미지 삭제
    try {
      await fs.promises.unlink(imagePath);
    } catch (unlinkErr) {
      console.error("❗ 이미지 삭제 실패:", unlinkErr);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("❌ 분석 실패:", err);

    if (err.code === "ENOENT") {
      return res.status(500).json({
        success: false,
        error: "분석 데이터 파일이 존재하지 않습니다.",
      });
    }

    res.status(500).json({
      success: false,
      error: "서버 오류가 발생했습니다.",
    });
  }
});

// multer 및 기타 에러 핸들링
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: "파일 용량이 너무 큽니다. 5MB 이하로 업로드해 주세요.",
    });
  } else if (err.message === "이미지 파일만 업로드할 수 있습니다.") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  console.error("❌ 미처리 에러:", err);
  res.status(500).json({
    success: false,
    error: "예기치 못한 서버 오류가 발생했습니다.",
  });
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});

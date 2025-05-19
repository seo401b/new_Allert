const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { analyzeFullImage } = require("./utils/analyzeUtils");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({origin: "*"})); // !!!! 배포 시에 특정 도메인만 !!!!
app.use(bodyParser.json({ limit: "50mb" }));

// 업로드 폴더 설정
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("✅ Allert 백엔드가 실행 중입니다.");
});

// 이미지 업로드 엔드포인트
app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const excelPath = path.join(__dirname, "DB/all_data.xlsx");

    const result = await analyzeFullImage(imagePath, excelPath);

    // 분석 후 이미지 삭제
    fs.unlinkSync(imagePath);

    res.json(result);
  } catch (err) {
    console.error("❌ 분석 실패:", err);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 이미지 업로드 서버 실행 중: http://localhost:${PORT}`);
});
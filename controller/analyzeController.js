const path = require("path");
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid"); // 추가: npm install uuid
const { analyzeFullImage } = require("../utils/analyzeUtils");

exports.analyzeImageFromRequest = async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "이미지가 필요합니다 (base64 형식)" });
    }

    const tempFilename = `temp_${uuidv4()}.jpg`;
    const imagePath = path.join(__dirname, "../DB", tempFilename);

    // 파일 저장
    await fs.writeFile(imagePath, Buffer.from(base64Image, "base64"));

    // 분석
    const result = await analyzeFullImage(imagePath, path.join(__dirname, "../DB/all_data.xlsx"));

    // 삭제
    await fs.unlink(imagePath).catch(err => {
      console.warn("⚠️ 이미지 삭제 실패:", err.message);
    });

    res.json(result);
  } catch (err) {
    console.error("❌ 분석 실패:", err.message);
    res.status(500).json({ error: "서버 오류" });
  }
};

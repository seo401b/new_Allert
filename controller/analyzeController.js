const path = require("path");
const fs = require("fs");
const { analyzeFullImage } = require("../utils/analyzeUtils");

exports.analyzeImageFromRequest = async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "이미지가 필요합니다 (base64 형식)" });
    }

    const imagePath = path.join(__dirname, "../DB/temp.jpg");
    fs.writeFileSync(imagePath, Buffer.from(base64Image, "base64"));

    const result = await analyzeFullImage(imagePath, path.join(__dirname, "../DB/all_data.xlsx"));
    res.json(result);
  } catch (err) {
    console.error("❌ 분석 실패:", err.message);
    res.status(500).json({ error: "서버 오류" });
  }
};

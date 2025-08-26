import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar1, avatar2 } = req.query;

  if (!avatar1 || !avatar2) {
    return res.status(400).json({ error: "Missing avatar URLs. Use ?avatar1=URL&avatar2=URL" });
  }

  try {
    // Load background template
    const template = await loadImage("https://i.ibb.co/5TwSHpP/Guardian-Place-full-1484178.jpg");

    // Load avatars
    const [av1Resp, av2Resp] = await Promise.all([
      axios.get(avatar1, { responseType: "arraybuffer" }),
      axios.get(avatar2, { responseType: "arraybuffer" }),
    ]);

    const avone = await loadImage(Buffer.from(av1Resp.data));
    const avtwo = await loadImage(Buffer.from(av2Resp.data));

    // Create canvas same as template size
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // Helper to draw circular avatars
    const drawCircleImage = (img, x, y, width, height) => {
      const size = Math.min(width, height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();
    };

    // Draw avatars
    drawCircleImage(avone, 40, 260, 360, 370);
    drawCircleImage(avtwo, 40, 980, 360, 370);

    // Send final image as PNG
    res.setHeader("Content-Type", "image/png");
    const buffer = canvas.toBuffer("image/png"); // <-- corrected
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}

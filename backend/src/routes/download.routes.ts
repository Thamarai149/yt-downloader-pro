
import { Router } from "express";
import { getVideoInfo, downloadAudio, downloadVideo } from "../controllers/download.controller";

const router = Router();

router.post("/info", getVideoInfo);
router.post("/audio", downloadAudio);
router.post("/video", downloadVideo);

// Legacy routes for backward compatibility
router.post("/audio/:quality", (req, res) => {
  req.body.quality = req.params.quality;
  downloadAudio(req, res);
});

router.post("/video/:quality", (req, res) => {
  req.body.format = req.params.quality;
  downloadVideo(req, res);
});

export default router;

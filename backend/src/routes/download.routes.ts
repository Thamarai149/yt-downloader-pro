
import { Router } from "express";
import { 
  getVideoInfo, 
  downloadAudio, 
  downloadVideo, 
  setDownloadPath, 
  getDownloadPath 
} from "../controllers/download.controller";

const router = Router();

// Main endpoints
router.post("/info", getVideoInfo);
router.post("/audio", downloadAudio);
router.post("/video", downloadVideo);

// Download path management
router.get("/download-path", getDownloadPath);
router.post("/download-path", setDownloadPath);

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

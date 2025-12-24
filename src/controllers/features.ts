import { Request, Response, NextFunction } from "express";
import { dbClient } from "../db/config";
import QRCode from "qrcode";

export const getUrlAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;

    const { rows: urlRows } = await dbClient.query(
      "SELECT id, short_code, long_url, click_count, created_at FROM urls WHERE short_code = $1",
      [shortCode]
    );

    if (!urlRows.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const url = urlRows[0];

    const [clicks, browsers, os, devices] = await Promise.all([
      dbClient.query(
        "SELECT ip_address, browser_name, os_name, device_type, referer, clicked_at FROM analytics WHERE url_id = $1 ORDER BY clicked_at DESC LIMIT 50",
        [url.id]
      ),
      dbClient.query(
        "SELECT browser_name as name, COUNT(*) as count FROM analytics WHERE url_id = $1 GROUP BY browser_name ORDER BY count DESC LIMIT 5",
        [url.id]
      ),
      dbClient.query(
        "SELECT os_name as name, COUNT(*) as count FROM analytics WHERE url_id = $1 GROUP BY os_name ORDER BY count DESC LIMIT 5",
        [url.id]
      ),
      dbClient.query(
        "SELECT device_type as name, COUNT(*) as count FROM analytics WHERE url_id = $1 GROUP BY device_type ORDER BY count DESC",
        [url.id]
      )
    ]);

    res.status(200).json({
      url,
      summary: {
        totalClicks: parseInt(url.click_count),
        browsers: browsers.rows,
        os: os.rows,
        devices: devices.rows
      },
      recentClicks: clicks.rows
    });
  } catch (error) {
    next(error);
  }
};


export const generateQRCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const shortUrl = `${process.env.API_BASE_URL}/v1/shorten/${shortCode}`;

    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
    
    // We can return the data URL or stream the image. Data URL is easier for frontend.
    res.status(200).json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    next(error);
  }
};

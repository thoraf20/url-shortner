import { nanoid } from "nanoid";
import { dbClient } from "../db/config";

export const generateShortUrl = async (req, res, next) => {
  const { longUrl } = req.body;
  const shortCode = nanoid(6);

  // TODO: use a cache instead
  const { rows } = await dbClient.query(
    "SELECT * FROM urls WHERE long_url = $1",
    [longUrl]
  );

  if (rows.length) {
    return res
      .status(409)
      .json({
        msg: "URL already exists",
        shortUrl: `${process.env.API_BASE_URL}/${rows[0].short_code}`,
      });
  }

  await dbClient.query(
    "INSERT INTO urls (short_code, long_url) VALUES ($1, $2)",
    [shortCode, longUrl]
  );

  return res
    .status(201)
    .json({ shortUrl: `${process.env.API_BASE_URL}/${shortCode}` });
}

export const redirectToLongUrl = async (req, res, next) => {
  const { shortCode } = req.params;

  const { rows } = await dbClient.query(
    "SELECT long_url FROM urls WHERE short_code = $1",
    [shortCode]
  );

  if (!rows.length) return res.status(404).json({ error: "Not found" });

  return res.status(200).json({ longUrl: rows[0].long_url });
}
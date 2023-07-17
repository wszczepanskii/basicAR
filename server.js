import https from "https";
import fs from "fs";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

app.get("/", (req, res) => res.sendFile(__dirname + "\\index.html"));

https
	.createServer(
		{
			cert: fs.readFileSync("./localhost.crt"),
			key: fs.readFileSync("./localhost.key"),
		},
		app
	)
	.listen(4430);
console.log("Server listening on https://localhost:4430/");

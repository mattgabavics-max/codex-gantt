import "dotenv/config";
import { createApp } from "./server";

const app = createApp();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

import { readFileSync, writeFileSync } from "node:fs"

const apiUrl = new URL(process.env.VITE_API_URL)
if (apiUrl.protocol !== "https:") {
  throw new Error("Production VITE_API_URL must use HTTPS")
}
const config = readFileSync("nginx.conf", "utf8")
writeFileSync("nginx.generated.conf", config.replaceAll("__COTIX_API_ORIGIN__", apiUrl.origin))

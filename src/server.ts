import build from "./app"
import config from "./config"

const server = build({
  logger: {
    level: "info",
    prettyPrint: true,
  },
})

const port: number = (() => {
  let port: any = config.get("PORT")
  if (!port) {
    throw new Error("No port is defined!")
  }
  port = parseInt(port, 10)
  return port
})()

server.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at address ${address}`)
})

const debugMiddleware = (req, res, next) => {
    console.log("\n--- DEBUG REQUEST ---")
    console.log(`${req.method} ${req.originalUrl}`)
    console.log("Params:", req.params)
    console.log("Query:", req.query)
    console.log("User:", req.user ? req.user._id : "No user")
    console.log("--- END DEBUG ---\n")
    next()
  }
  
  module.exports = debugMiddleware
  
  
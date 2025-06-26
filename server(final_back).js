const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const routes = require("./routes/routes");
const adminRoutes = require("./routes/adminRoutes");
const apiRoutes = require("./routes/apiRoutes");
const errorHandler = require("./middleware/errorHandler");
const bodyParser = require("body-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const axios = require("axios");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cookieParser());

const corsOptions = {
  origin: ['https://fefdybraingym.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
  optionsSuccessStatus: 204 // some legacy browsers choke on 200 for OPTIONS
};

app.use(cors(corsOptions));

// Make sure you have this, so OPTIONS requests respond with proper headers:
app.options('*', cors(corsOptions));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("layout", "admin/layout");

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: "lax",
      httpOnly: true,
    } // Set to `true` in production with HTTPS
  })
);
app.use("/admin", adminRoutes);
app.use("/v1", apiRoutes);

app.post('/proxy-pdf', express.json(), async (req, res) => {
  const pdfUrl = req.body.pdf_url;

  if (!pdfUrl || !pdfUrl.startsWith("http")) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'application/pdf');
    res.send(response.data);
  } catch (err) {
    console.error('Error fetching PDF:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

app.use(errorHandler);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API running at http://localhost:${port}/v1/`);
});

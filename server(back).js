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

// app.use(cors({
//   origin: 'http://localhost:3000'
// }));
app.use(cookieParser());

app.use(cors({
  origin: ['https://fefdybraingym.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("layout", "admin/layout");

app.use(express.static("public"));
// app.use(express.static("public", {
//   setHeaders: (res, path, stat) => {
//     res.set('Access-Control-Allow-Origin', '*');
//     res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
//     res.set('Access-Control-Allow-Headers', 'Content-Type');
//   }
// }));
// app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_fallback_secret", // Use .env secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,  // 1 day
    //   httpOnly: true,  // to prevent client-side access
    //   secure: true,    // if using HTTPS
      sameSite: 'strict'  // helps mitigate CSRF attacks
    } // Set to `true` in production with HTTPS
  })
);
app.use("/admin", adminRoutes);
app.use("/v1", apiRoutes);

// app.get('/proxy-pdf', async (req, res) => {
// //   const pdfUrl = 'http://npm.d2cwebsolutions.in/public/uploads/ByteBeatJan2024.pdf';
// //   const pdfUrl = 'http://npm.d2cwebsolutions.in/public/uploads/1745993943455-230939133.pdf';
//   const pdfUrl = req.pdf_url;

//   try {
//     const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.send(response.data);
//   } catch (err) {
//     console.error('Error fetching PDF:', err.message);
//     if (err.response) {
//       console.error('Status:', err.response.status);
//       console.error('Headers:', err.response.headers);
//       console.error('Data:', err.response.data?.toString?.().slice?.(0, 200));
//     }
//     // res.status(500).send('Failed to fetch PDF');
//     res.status(200).json({ message: err.message });
//   }
// });
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

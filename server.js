const express=require("express")
const mongoose=require("mongoose")
const bodyParser=require("body-parser")
const cors=require("cors")
const morgan=require("morgan")
require("dotenv").config()
const {readdirSync}=require('fs')
const {logStorage}=require("./utils")
const helmet = require('helmet');
const multer = require("multer")


const app=express()
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

//middleware

const upload = multer({ storage: logStorage });

app.use(upload.single('logfile'));
app.use(express.urlencoded({ extended: false }))
app.use(morgan("dev"))
app.use(bodyParser.json({limit:"2mb"}))
app.use(cors())
app.use(helmet());

//we will combine all the route from the routes folder
readdirSync("./routes").map((r)=>app.use("/api",require("./routes/"+r)))

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});



const port=process.env.PORT || 8080

app.listen(port,()=>console.log(`server is running in port ${port}`))






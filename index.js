const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
app.use(cookieparser());
// now middleware to verify my token automatically, so its allow protected route
const dotenv=require('dotenv')
dotenv.config()

const cors = require("cors");
app.use(cors());
let verifyToken = (req, res, next) => {
  let token = req.header("Authorization");
  // let token=req.cookies.token
  console.log(req);
  console.log("token bk:", token);
  if (!token) {
    res.json({ error: "Please provide a token, please!" });
  } else {
    try {
      const decode = jwt.verify(token, "mysecretkey");
      if (decode) next();
    } catch (err) {
      res.json({ error: "invalid Token" });
    }
  }
};

const PORT =process.env.PORT || 7777;
app.use(express.json());

const User = require("./model/User");
const Blog = require("./model/Blog");

let dbConnect = async () => {
  try {
    // await mongoose.connect("mongodb://127.0.0.1:27017/blog")
    await mongoose.connect(process.env.MONGO_URI)

    console.log("Db Connection Success!");
  } catch (err) {
    console.log(err);
  }

  app.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
  });
};

dbConnect();

app.get("/health", (req, res) => {
  res.json("Server health: Good!");
});

app.get("/getallblog", async (req, res) => {
  // console.log(req.params)
  let allBlog = await Blog.find({});
  if (allBlog) {
    res.send(allBlog);
  } else {
    res.send("Please Create a Blog !");
  }
});
app.get("/read-more/:_id", async (req, res) => {
  let search = await Blog.findById({ _id: req.params._id });
  if (search) {
    res.json(search);
  } else {
    res.json({ message: "No Result Found !" });
  }
});
app.post("/create-blog", verifyToken, async (req, res) => {
  // console.log(req.body)
  let { _id, title, description, author } = req.body;
  // console.log(title)
  let newDoc = new Blog({
    _id: _id,
    title: title,
    description: description,
    author: author,
  });
  try {
    await newDoc.save();
    console.log("Data saved Success !");
    res.json("Data Saved Success !");
  } catch (err) {
    res.json(err);
  }
  // console.log("check")
});

app.put("/edit-blog/:_id", verifyToken, async (req, res) => {
  let update = {
    title: req.body.title,
    description: req.body.description,
  };
  try {
    await Blog.findOneAndUpdate({ _id: req.params._id }, update);
    res.json("Update success !");
  } catch (err) {
    res.json("error in updating:", err);
  }
});

app.delete("/delete-blog/:_id", verifyToken, async (req, res) => {
  try {
    await Blog.deleteOne({ _id: req.params._id });
    res.json("Delete Success !");
  } catch (err) {
    res.json("error in deleting:", err);
  }
});

// auth route
app.post("/auth/signup", async (req, res) => {
  let { name, email, password } = req.body;
  console.log(req.body);
  let isPresent = await User.findOne({ name: name });
  // console.log(isPresent)
  if (!isPresent) {
    // see you are saving the plain  password, you need to cipher it

    const saltRounds = 10;
    const myPlaintextPassword = password;

    const hashPwd = await bcrypt.hash(myPlaintextPassword, saltRounds);
    let newUser = new User({
      // _id:_id,
      name: name,
      email: email,
      password: hashPwd,
    });
    try {
      await newUser.save();
      console.log("new User account Created !");
      res.json("status: account created!");
    } catch (err) {
      console.log(err);
    }
  } else {
    res.json("email Already Registered !");
  }
});

app.post("/auth/login", async (req, res) => {
  let { email, password } = req.body;
  let userDetail = await User.findOne({ email: email });
  // console.log(req.body)
  if (userDetail) {
    // proceed to chec for password
    let isTrue = await bcrypt.compare(password, userDetail.password);
    if (isTrue) {
      // res.json("Login Success !")
      // if password is true then generate the token
      let token = jwt.sign({ email: userDetail.email }, "mysecretkey", {
        expiresIn: "4h",
      });
      // res.cookie("token",token,{httpOnly:true})
      res.json({ token: token });
      // res.json({message:"User Logged in !"})
    } else {
      res.json("Please Check Password !");
    }
  } else {
    res.json("Email Not registered !");
  }
  // res.send("check !")
});

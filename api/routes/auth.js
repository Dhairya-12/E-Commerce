const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
// async - Used to perfom task asynchronously to show the status after registration.
router.post("/register", async (req, res) => {
  // Provide validation over here
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(  // Advanced Encryption Standard (AES)
        req.body.password,
        process.env.PASS_SEC
      ).toString(),
  });
  
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    // If there is no user with that name.
    !user && res.status(401).json("Wrong credentials!");
    // Fetch password in hash 
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    // Convert password from hash to string
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    // Checking user by it's id and adminRole.
    // AccessToken is for login purposes, if it expires user needs to relogin.
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      {expiresIn:"3d"}
    );

    const { password, ...others } = user._doc;

    // ... - is called spered operator.
    res.status(200).json({...others, accessToken});
    // res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;





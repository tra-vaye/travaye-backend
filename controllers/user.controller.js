import passport from "passport";
import { User } from "../models/User.model.js";

export const registerUser = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const fullName = req.body.fullName;

  //   // Encryption
  //   const salt = await bcrypt.genSalt(13);
  //   const hashedPassword = await bcrypt.hash(password, salt);
  User.register(
    {
      username: username,
      email: email,
      fullName: fullName,
      password: password,
    },
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(400).json({
          errmsg: "A User with the given username or email exists",
        });
      } else if (!err) {
        next();
      }

      // go to the next middleware
    }
  );
};

export const loginUser = (req, res, next) => {
  passport.authenticate("userLocal", function (err, user, info) {
    console.log(user);
    if (err) {
      return next(err);
    }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("http:localhost:3000/user");
    });
  })(req, res, next);
};
// Logout
export const logUserOut = (req, res) => {
  req.logOut();
  res.redirect("/login");
};

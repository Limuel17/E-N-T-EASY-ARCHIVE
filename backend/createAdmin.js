
import bcrypt from "bcrypt";
import connectDB from "./database/connections.js";
import User from "./models/User.js";

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@gmail.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin", 10);

    // Create admin
    const newUser = new User({
      name: "ADMIN",
      email: "admin@gmail.com",
      password: hashedPassword,
      address: "admin address",
      position: "IT",
      role: "admin",

      // No profile image initially
      profileImage: "",
    });

    await newUser.save();

    console.log("Admin user created successfully.");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();


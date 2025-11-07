import bcrypt from "bcrypt";
import db from "./conn.mjs";

const SALT_ROUNDS = 10;

/**
 * Creates a default admin user if no staff exists in the database
 * This ensures there's always an admin account to bootstrap the system
 */
export async function initializeAdmin() {
  try {
    const staffCollection = await db.collection("staff");
    
    // Check if any staff member already exists
    const existingStaff = await staffCollection.findOne({ username: "admin" });
    
    if (existingStaff) {
      console.log("Admin user already exists");
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("Admin@123", SALT_ROUNDS);
    
    const defaultAdmin = {
      username: "admin",
      password: hashedPassword,
      fullName: "System Administrator",
      email: "admin@system.com",
      role: "staff",
      status: "approved", // ← Already approved! so that they can approve other staff
      createdAt: new Date(),
      isDefaultAdmin: true // Flag to identify default admin
    };

    await staffCollection.insertOne(defaultAdmin);
    
    console.log("*** Default admin user created successfully! ***");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("!! Please change this password after first login!");
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

export default initializeAdmin;
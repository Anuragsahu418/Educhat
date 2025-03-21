import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  // Male Users
  {
    email: "ameypawar@gmail.com",
    fullName: "Amey pawar",
    password: "123456",
    profilePic: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffreepng%2Fbusiness-people-avatar-icon-user-profile-free-vector_4815126.html&psig=AOvVaw2Bgp_gAv5LGaiEaTYB2i9p&ust=1738664467850000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIjfjoSkp4sDFQAAAAAdAAAAABAE",
  },
  {
    email: "anuragsahu@gmail.com",
    fullName: "Anurag sahu",
    password: "123456",
    profilePic: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffreepng%2Fbusiness-people-avatar-icon-user-profile-free-vector_4815126.html&psig=AOvVaw2Bgp_gAv5LGaiEaTYB2i9p&ust=1738664467850000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIjfjoSkp4sDFQAAAAAdAAAAABAE",
  },
  {
    email: "ssiddharthsingh@gmail.com",
    fullName: "Siddharth singh",
    password: "123456",
    profilePic: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffreepng%2Fbusiness-people-avatar-icon-user-profile-free-vector_4815126.html&psig=AOvVaw2Bgp_gAv5LGaiEaTYB2i9p&ust=1738664467850000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIjfjoSkp4sDFQAAAAAdAAAAABAE",
  },
  {
    email: "tanmaythatikonda@gmail.com",
    fullName: "Tanmay Thatikonda",
    password: "123456",
    profilePic: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffreepng%2Fbusiness-people-avatar-icon-user-profile-free-vector_4815126.html&psig=AOvVaw2Bgp_gAv5LGaiEaTYB2i9p&ust=1738664467850000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIjfjoSkp4sDFQAAAAAdAAAAABAE",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
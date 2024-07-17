import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  console.log("register task", req.body);
  const { userId, title, content, date, complete, important } = req.body;

  try {
    // Validate the input
    if (!userId || !title || !content || !date) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // Find the user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the new post
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        date,
        complete,
        important,
        authorId: userId, // Associate the post with the user
      },
    });

    res
      .status(201)
      .json({ post: newPost, message: "Post created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const display = async (req, res) => {
  const { type } = req.params;
  const userId = req.user.id;

  try {
    let tasks;
    switch (type) {
      case "completed":
        tasks = await prisma.post.findMany({
          where: {
            authorId: userId,
            complete: true,
          },
        });
        break;
      case "important":
        tasks = await prisma.post.findMany({
          where: {
            authorId: userId,
            important: true,
          },
        });
        break;
      case "doItNow":
        //get date in dd-mm-yyyy formatx
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${
          currentDate.getMonth() + 1
        }/${currentDate.getFullYear()}`;
        tasks = await prisma.post.findMany({
          where: {
            authorId: userId,
            date: {
              lte: formattedDate, // Find tasks with a date less than or equal to today
            },
          },
        });
        break;
      default:
        tasks = await prisma.post.findMany({
          where: {
            authorId: userId,
          },
        });
        break;
    }
    res.status(200).json({ tasks, message: `Fetched ${type} tasks` });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const edit = async (req, res) => {
  console.log("edit task", req.body);
};

export const remove = async (req, res) => {
  console.log("remove task", req.body);
};
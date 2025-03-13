const path = require("path");
const expenseData = require("../models/expenseData");
const rootDir = require("../util/path");
const User = require("../models/user");
const sequelize = require("../util/database");
const { Op } = require("sequelize");
const moment = require("moment");
const AWS = require("aws-sdk");
const fs = require("fs");
const DownloadHistory = require("../models/downloadHistory");


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

exports.downloadExpensesAndUploadToS3 = async (req, res) => {
  const userId = req.user.id;
  try{
    const expenses = await expenseData.findAll({where:{userId}});
     if(expenses.length === 0){
      return res.status(404).json({message:"no expenses found to download"})
     }
     const csvData = [
      "Amount,Description,Category,Date",
      ...expenses.map(
        (item) =>
          `${item.expenseAmount},${item.description},${item.category},${item.createdAt}`
      ),
    ].join("\n");

    const fileName = `expenses_${userId}_${Date.now()}.csv`;
    const filePath = path.join(__dirname, "../temp", fileName);
    fs.writeFileSync(filePath, csvData);

    // Upload to S3
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `expenses/${fileName}`,
      Body: fileContent,
      ContentType: "text/csv",
    };

    const s3Upload = await s3.upload(params).promise();
    const fileUrl = s3Upload.Location;

    // Save file URL in DB
    await DownloadHistory.create({ userId, fileUrl });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    res.status(200).json({ fileUrl, message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error downloading and uploading expenses:", error);
    res.status(500).json({ error: "Failed to process request" });
  }

  
};
exports.getDownloadHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const history = await DownloadHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching download history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.getExpensePage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "expense.html"));
};

exports.postExpenseData = async (req, res) => {
  const userId = req.user.id;
  const t = await sequelize.transaction();
  try {
    const { amount, description, category } = req.body;
    const expenseAmount = parseInt(amount);

    // add all the expense amount for same userId to store it in the user table
    await User.increment("totalExpense", {
      by: expenseAmount,
      where: { id: userId },
      transaction: t,
    });

    await expenseData.create(
      {
        expenseAmount,
        description,
        category,
        userId,
      },
      { transaction: t }
    );
    await t.commit();

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    await t.rollback();
    res.status(500).json({ error: "Error adding data" });
  }
};

exports.getExpensesDataInJson = async (req, res) => {
  const userId = req.user.id; // Get userId from the middleware

  try {
    const items = await expenseData.findAll({ where: { userId: userId } });
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching items:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch items", details: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const expenseId = parseInt(req.params.expenseId);
  const userId = req.user.id; // Get userId from the middleware
  const t = await sequelize.transaction();

  try {
    //  Fetching expense with transaction
    const expense = await expenseData.findOne({
      where: { id: expenseId, userId: userId },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }

    // Subtracting expense amount from user's totalExpense
    await User.decrement("totalExpense", {
      by: expense.expenseAmount,
      where: { id: userId },
      transaction: t,
    });

    //Delete the expense using the same transaction
    await expense.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    await t.rollback();
    return res.status(500).json({ error: "Error deleting expense" });
  }
};

exports.getExpensesDataPaginated = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.row) || 5;
  const offset = (page - 1) * limit;
  const timeFilter = req.query.filter || "all";

  //build the where clause with filtering on createdAt
  let whereClause = { userId: userId };

  if (timeFilter !== "all") {
    if (timeFilter === "day") {
      // Get start of day using moment
      const startOfDay = moment().startOf("day").toDate();
      whereClause.createdAt = { [Op.gte]: startOfDay };
    } else if (timeFilter === "week") {
      // Get start of week (default week starts on Sunday; change locale if needed)
      const startOfWeek = moment().startOf("week").toDate();
      whereClause.createdAt = { [Op.gte]: startOfWeek };
    } else if (timeFilter === "month") {
      const startOfMonth = moment().startOf("month").toDate();
      whereClause.createdAt = { [Op.gte]: startOfMonth };
    } else if (timeFilter === "year") {
      const startOfYear = moment().startOf("year").toDate();
      whereClause.createdAt = { [Op.gte]: startOfYear };
    }
  }
  if (req.query.from && req.query.to) {
    whereClause.createdAt = {
      [Op.between]: [new Date(req.query.from), new Date(req.query.to)],
    };
  }

  try {
    const { count, rows } = await expenseData.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      expenses: rows,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching paginated expenses:", error);
    res.status(500).json({ error: "Error fetching paginated expenses" });
  }
};

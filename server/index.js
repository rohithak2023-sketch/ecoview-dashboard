const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ GET devices from DB
app.get("/api/devices", async (req, res) => {
  const { data, error } = await supabase
    .from("home_devices")
    .select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
});

// ✅ ADD device
app.post("/api/devices", async (req, res) => {
  const { data, error } = await supabase
    .from("home_devices")
    .insert([req.body])
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});

// ✅ DELETE device
app.delete("/api/devices/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("home_devices")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json(error);

  res.json({ message: "Deleted" });
});

// ✅ UPDATE device
app.put("/api/devices/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("home_devices")
    .update(req.body)
    .eq("id", id);

  if (error) return res.status(500).json(error);

  res.json({ message: "Updated" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
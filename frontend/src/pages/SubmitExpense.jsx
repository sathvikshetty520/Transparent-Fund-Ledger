 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitExpense } from "../services/expense.service";

export default function SubmitExpense() {
  const [campaignId, setCampaignId] = useState("camp_1");
  const [category, setCategory] = useState("Equipment");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitExpense({ campaignId, category, amount: parseFloat(amount), vendor, description });
      alert("Expense request submitted successfully!");
      navigate("/campaigns");
    } catch (err) {
      alert("Failed to submit expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Submit Campaign Expense</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Campaign</label>
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} style={{ width: "100%", padding: "0.5rem" }}>
            <option value="camp_1">Clean Water Initiative</option>
            <option value="camp_2">Community Solar Grid</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Logistics, Equipment, Labour"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500.00"
            required
            min="1"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Vendor / Payee</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. AquaFilters Ltd"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide justification and proof details..."
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.6rem", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Submitting..." : "Submit Expense"}
        </button>
      </form>
    </div>
  );
}

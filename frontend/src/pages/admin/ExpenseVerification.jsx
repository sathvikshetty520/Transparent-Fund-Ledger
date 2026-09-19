 
import React, { useEffect, useState } from "react";
import { getPendingExpenses, updateExpenseStatus } from "../../services/allocation.service";
import { formatCurrency, formatDate } from "../../utils/format";

export default function ExpenseVerification() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingExpenses().then((data) => {
      setExpenses(data);
      setLoading(false);
    });
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateExpenseStatus(id, status);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      alert(`Expense marked as ${status}`);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <p>Loading pending expense requests...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "1rem auto" }}>
      <h2>Admin Expense Verification</h2>
      <p style={{ color: "#666" }}>Review and approve/reject expense submissions before committing to the transparent ledger.</p>

      {expenses.length === 0 ? (
        <p style={{ marginTop: "1.5rem", color: "#22c55e", fontWeight: "bold" }}>
          All caught up! No pending expense approvals.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          {expenses.map((exp) => (
            <div key={exp.id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <strong>{exp.campaignTitle}</strong>
                <span style={{ fontSize: "0.85rem", color: "#666" }}>Submitted: {formatDate(exp.submittedAt)}</span>
              </div>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Vendor:</strong> {exp.vendor} ({exp.category})
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Amount:</strong> {formatCurrency(exp.amount)}
              </p>
              <p style={{ margin: "0.25rem 0", color: "#444" }}>{exp.description}</p>
              
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleAction(exp.id, "APPROVED")}
                  style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(exp.id, "REJECTED")}
                  style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
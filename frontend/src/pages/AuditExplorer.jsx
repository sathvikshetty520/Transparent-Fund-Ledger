import React, { useEffect, useState } from "react";
import { getLedger } from "../services/ledger.service";
import { formatCurrency, formatDate } from "../utils/format";

export default function AuditExplorer() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLedger("camp_1")
      .then((data) => {
        setLedger(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load ledger data:", err);
        setLedger([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading transparent audit ledger...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "1rem auto" }}>
      <h2>Audit & Transparency Explorer</h2>
      <p style={{ color: "#666" }}>Live verification of campaign expenditures and proof records.</p>

      {ledger.length === 0 ? (
        <p style={{ marginTop: "1rem", color: "#666" }}>No ledger records found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Date</th>
              <th style={{ padding: "0.5rem" }}>Vendor / Category</th>
              <th style={{ padding: "0.5rem" }}>Amount</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Ledger Hash</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem" }}>{formatDate(item.date)}</td>
                <td style={{ padding: "0.5rem" }}>
                  <strong>{item.vendor}</strong>
                  <br />
                  <small style={{ color: "#777" }}>{item.category}</small>
                </td>
                <td style={{ padding: "0.5rem" }}>{formatCurrency(item.amount)}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: item.status === "APPROVED" ? "#e6fffa" : "#fffbe6",
                      color: item.status === "APPROVED" ? "#047857" : "#b45309",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
                  {item.hash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
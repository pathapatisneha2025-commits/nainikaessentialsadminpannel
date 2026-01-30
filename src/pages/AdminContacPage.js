import React, { useEffect, useState } from "react";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://nainikaessentialsdatabas.onrender.com/contact/messages"
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `https://nainikaessentialsdatabas.onrender.com/contact/messages/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const deleteMessage = async (id) => {
    try {
      const res = await fetch(
        `https://nainikaessentialsdatabas.onrender.com/contact/messages/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete message");
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="admin-contact-wrapper">
      <h2>Customer Messages</h2>

      <table className="contact-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id}>
              <td>{msg.id}</td>
              <td>{msg.full_name}</td>
              <td>{msg.email}</td>
              <td className="message-cell">{msg.message}</td>
              <td>
                <span className={`status-badge ${msg.status}`}>
                  {msg.status.toUpperCase()}
                </span>
              </td>
              <td>{new Date(msg.created_at).toLocaleString()}</td>
              <td className="actions-cell">
                {msg.status !== "read" && (
                  <button
                    className="btn blue"
                    onClick={() => updateStatus(msg.id, "read")}
                  >
                    Mark Read
                  </button>
                )}
                {msg.status !== "replied" && (
                  <button
                    className="btn blue"
                    onClick={() => updateStatus(msg.id, "replied")}
                  >
                    Mark Replied
                  </button>
                )}
                <button
                  className="btn red"
                  onClick={() => deleteMessage(msg.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {messages.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No messages found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <style>{`
        .admin-contact-wrapper {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        h2 {
          color: #084298;
          margin-bottom: 20px;
        }

        .contact-table {
          width: 100%;
          border-collapse: collapse;
        }

        .contact-table th,
        .contact-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e0e7ff;
          text-align: left;
          font-size: 14px;
        }

        .contact-table th {
          background: #e7f1ff;
          color: #084298;
          font-weight: 600;
        }

        .contact-table tr:hover {
          background: #f1f7ff;
        }

        .message-cell {
          max-width: 250px;
          word-break: break-word;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }

        .status-badge.new {
          background: #0b5ed7;
        }
        .status-badge.read {
          background: #198754;
        }
        .status-badge.replied {
          background: #fd7e14;
        }

        .actions-cell .btn {
          padding: 6px 10px;
          margin: 2px;
          border-radius: 6px;
          border: none;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn.blue {
          background: #0b5ed7;
          color: white;
        }
        .btn.blue:hover {
          background: #084298;
        }

        .btn.red {
          background: #dc3545;
          color: white;
        }
        .btn.red:hover {
          background: #a71d2a;
        }

        @media (max-width: 768px) {
          .contact-table th, .contact-table td {
            font-size: 12px;
            padding: 8px 10px;
          }

          .message-cell {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminContactMessages;

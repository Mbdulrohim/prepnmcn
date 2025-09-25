"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      signIn("credentials", { email: form.email, password: form.password });
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Institution Name (UPPERCASE)"
        value={form.institution}
        onChange={(e) =>
          setForm({ ...form, institution: e.target.value.toUpperCase() })
        }
        required
      />
      {error && <p>{error}</p>}
      <button type="submit">Register</button>
    </form>
  );
}

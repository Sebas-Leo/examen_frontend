import {
Routes,
Route,
Link,
Navigate,
Outlet,
useNavigate,
useParams,
} from "react-router";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { api } from "./api";


function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post<{ token: string }>(
        "/auth/login",
        { email, password }
      );

    localStorage.setItem("token", response.data.token);
    navigate("/dashboard", { replace: true });

    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("No se pudo completar el inicio de sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-sm space-y-4"
    >
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>

      <label className="block">
        Correo
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Contraseña
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full rounded border p-2"
        />
      </label>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <p>
        <Link to="/register" className="text-blue-600 underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}


function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!/^[\x20-\x7E]{8,72}$/.test(password)) {
      setError("La contraseña debe contener entre 8 y 72 caracteres");
      return;
    }


    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      password,
    });

      navigate("/login", { replace: true });

    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.status=== 409 &&
        err.response.data?.code==="EMAIL_EXISTS"
      ) {
        setError("Este correo ya está registrado.");
      } else {
        setError("No se pudo completar el registro");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>

      <label className="block">
        Nombre
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Correo
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          maxLength={254}
          className="w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Contraseña
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full rounded border p-2"
        />
      </label>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>

      <p>
        <Link to="/login" className="text-blue-600 underline">
          Ya tengo una cuenta
        </Link>
      </p>
    </form>
  );
}

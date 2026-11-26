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
      const response = await api.post<{token: string }>(
        "/auth/login",
        { email, password }
      );

    localStorage.setItem("token", response.data.token);
    navigate("/dashboard", {replace: true });

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
        {loading ? "Ingresando..":"Ingresar"}
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

  const [title, settitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
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
      title: title.trim(),
      email: email.trim(),
      password,
    });

      navigate("/login", { replace: true });

    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.status=== 409 &&
        err.response.data?.code==="NO_COPIES"
      ) {
        setError("El material no tiene ejemplares disponibles");
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
          value={title}
          onChange={e =>settitle(e.target.value)}
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
          onChange={e =>setEmail(e.target.value)}
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
          onChange={e =>setPassword(e.target.value)}
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

type material = {
  id: number;
  title: string;
  author: string;
  category: number;
  availableCopies: number;
  description: string;
};

type materialsResponse = {
  items: material[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};


function SpacesPage() {
  const [materials, setmaterials] = useState<material[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");


    api.get<materialsResponse>("/materials", {
      params: { page, size: 5 }
    })
      .then(response => {
        if (!active) return;

        setmaterials(response.data.items);
        setTotalPages(response.data.totalPages);
      })
      .catch(() => {
        if (active) {
          setError("Error al cargar las salas.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, retry]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">
        Biblioteca Activ
      </h1>

      <LogoutButton />
      <Link to="/my-loans" className="text-blue-600 underline">
        Mis reserva
      </Link>

      {loading ? (
        <p>Cargando..</p>
      ) : error ? (
        <div>
          <p className="text-red-600">{error}</p>
          <button onClick={() => setRetry(r => r + 1)}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {materials.length === 0 ? (
            <p>No hay materiales disponibles.</p>
          ) : (
            materials.map(material => (
              <article
                key={material.id}
                className="mb-3 rounded border bg-white p-4"
              >
                <h2 className="font-bold">{material.title}</h2>
                <p>Edificio: {material.author}</p>
                <p>Piso: {material.category}</p>
                <p>Turnos: {material.availableCopies}</p>

                <Link
                  to={`/materials/${material.id}`}
                  className="text-blue-600 underline"
                >
                  Ver detalle
                </Link>
              </article>
            ))
          )}

          <div className="flex items-center gap-4">
            <button
              disabled={page <= 1 || loading || materials.length === 0}
              onClick={() => setPage(p => p - 1)}
              className="rounded border px-3 py-2 disabled:opacity-40"
            >
              Anterior
            </button>

            <span>
              Página {page} de {totalPages}
            </span>

            <button
              disabled={page >= totalPages || loading || materials.length === 0}
              onClick={() => setPage(p => p + 1)}
              className="rounded border px-3 py-2 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}



function SpaceDetailPage() {
  const { id } = useParams();

  const [material, setmaterial] = useState<material | null>(null);
  const [attendees, setAttendees] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setLoadError("");

    api.get<material>(`/materials/${id}`)
      .then(response => {
        if (active) setmaterial(response.data);
      })
      .catch(() => {
        if (active) setLoadError("No se pudo cargar el material.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reload]);


  async function handleReserve(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setFormError("");
    setSuccess("");

    const numero = Number(attendees);

    if (
      attendees.trim() === "" ||
      !Number.isInteger(numero) ||
      numero < 1 ||
      numero > 6
    ) {
      setFormError("Ingresa un entero entre 1 y 6.");
      return;
    }

    setSending(true);

    try {
      await api.post(`/materials/${id}/loans`, {
        attendees: numero
      });

      setSuccess("Reserva realizada correctamente.");
      setAttendees("");

      setReload(r => r + 1);

    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.status === 409 &&
        err.response.data?.code === "NO_SLOTS"
      ) {
        setFormError("El material ya no muestra turnos");
        setReload(r => r + 1);
      } else {
        setFormError("No se pudo realizar la reserva.");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p>Cargando detalle...</p>;

  if (loadError) {
    return (
      <div>
        <p className="text-red-600">{loadError}</p>
        <button onClick={() => setReload(r => r + 1)}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!material) return <p>Sin datos del material</p>;

  return (
    <section className="space-y-4">
      <Link to="/dashboard" className="text-blue-600 underline">
        Volver al dashboard
      </Link>

      <h1 className="text-2xl font-bold">{material.title}</h1>

      <p>{material.description}</p>
      <p>author: {material.author}</p>
      <p>categoria: {material.category}</p>
      <p>copias disponibles: {material.availableCopies}</p>

      <form
        onSubmit={handleReserve}
        noValidate
        className="space-y-3"
      >
        <label className="block">
          Número de materiales
          <input
            type="number"
            min={1}
            max={6}
            step={1}
            value={attendees}
            onChange={e => setAttendees(e.target.value)}
            className="block w-full max-w-xs rounded border p-2"
          />
        </label>

        {formError && (
          <p className="text-red-600">{formError}</p>
        )}

        {success && (
          <p className="text-green-700">{success}</p>
        )}

        <button
          type="submit"
          disabled={sending || material.availableCopies === 0}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
        >
          {sending ? "Reservando..." : "Reservar"}
        </button>
      </form>
    </section>
  );
}


type Loan = {
  id: number;
  resourceId: number;
  resourcetitle: string;
  attendees: number;
  status: string;
};

function MyloansPage() {
  const [loans, setloans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api.get<Loan[]>("/me/loans")
      .then(r => {
        if (active) setloans(r.data);
      })
      .catch(() => {
        if (active) setError("Error al cargar reservas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reload]);

  if (loading) return <p>Cargando materiales...</p>;

  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <button onClick={() => setReload(r => r + 1)}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Mis reservas</h1>
      <Link to="/dashboard" className="text-blue-600 underline">
        Volver al dashboard
      </Link>

      {loans.length === 0 ? (
        <p>No tienes reservas.</p>
      ) : (
        loans.map(Loan => (
          <article
            key={Loan.id}
            className="rounded border bg-white p-4"
          >
          
            <p>ID: {Loan.id}</p>
            <h2 className="font-bold">{Loan.resourcetitle}</h2>
            <p>atencion: {Loan.attendees}</p>
            <p>Estado: {Loan.status}</p>

            <CancelLoanButton
              Loan={Loan}
              onUpdated={() => setReload(r => r + 1)}
            />
          </article>
        ))
      )}
    </section>
  );
}

function CancelLoanButton({
  Loan,
  onUpdated
}: {
  Loan: Loan;
  onUpdated: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");


  if (Loan.status !== "ACTIVE") return null;

  async function handleCancel() {
    
    if (!window.confirm("¿Cancelar esta reserva?")) return;

    setSending(true);
    setError("");

    try {
     
      await api.patch(`/loans/${Loan.id}/cancel`);
      window.alert("Reserva cancelada correctamente.");

     
      onUpdated();
    } catch (err) {
      
      if (
        isAxiosError(err) &&
        err.response?.status === 409 &&
        err.response.data?.code === "INVALID_STATE"
      ) {
        window.alert("La reserva ya no puede cancelarse.");
        onUpdated();
      } else {
        setError("No se pudo cancelar la reserva.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={sending}
        className="rounded bg-red-600 px-3 py-2 text-white disabled:opacity-40"
      >
        {sending ? "Cancelando..." : "Cancelar reserva"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}


function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function LogoutButton() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <button
      onClick={logout}
      className="rounded bg-red-600 px-4 py-2 text-white"
    >
      Cerrar sesión
    </button>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<SpacesPage />} />
          <Route path="/materials/:id" element={<SpaceDetailPage />} />
          <Route path="/my-loans" element={<MyloansPage />} />
        </Route>

        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </main>
  );
}

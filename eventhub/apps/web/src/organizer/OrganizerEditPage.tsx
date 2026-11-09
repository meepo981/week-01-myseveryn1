
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";

import {
  getOrganizerEvents,
  updateOrganizerEvent
} from "./organizerApi";

import { eventKeys } from "../api/queryKeys";

export function OrganizerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const {
    data: events,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["organizer", "events"],
    queryFn: getOrganizerEvents,
    retry: false,
  });

  const event = events?.find((item) => item.id === id);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
    }
  }, [event]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID події відсутній");

      return updateOrganizerEvent(id, {
        title: title.trim(),
        description,
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: eventKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["organizer"],
        }),
      ]);

      navigate("/organizer");
    },
  });

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim() || mutation.isPending) return;

    mutation.mutate();
  }

  if (isPending) {
    return <main className="page">Завантаження...</main>;
  }

  if (isError) {
    return (
      <main className="page">
        <p role="alert">Помилка завантаження подій.</p>
        <Link to="/organizer">До списку</Link>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="page">
        <h2>Подію не знайдено</h2>
        <Link to="/organizer">До списку</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <Link to="/organizer">
        ← До списку подій
      </Link>

      <section className="organizer-form">
        <h1>Редагування події</h1>

        <form onSubmit={submit}>
          <label>
            Назва події
            <input
              type="text"
              value={title}
              maxLength={200}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            Опис події
            <textarea
              rows={5}
              value={description}
              maxLength={5000}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </label>

          {mutation.isError && (
            <p role="alert">
              {mutation.error.message}
            </p>
          )}

          {mutation.isPending && (
            <p>Збереження змін...</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || !title.trim()}
          >
            Зберегти зміни
          </button>
        </form>
      </section>
    </main>
  );
}

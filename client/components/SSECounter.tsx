"use client";

import { useEffect, useState } from "react";

interface SSECounterProps {
  url: string;
  title?: string;
}

export function SSECounter({
  url,
  title = "Contador en tiempo real",
}: SSECounterProps) {
  const [status, setStatus] = useState<
    "connecting" | "listening" | "completed" | "error"
  >("connecting");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sse = createSSEObservableWithFetch(url);
    setStatus("connecting");

    const subscription = sse.subscribe({
      next: (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.count !== undefined) {
            setCount(data.count);
            setStatus("listening");
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
          setStatus("error");
        }
      },
      complete: () => {
        setStatus("completed");
      },
      error: (err: Error) => {
        setStatus("error");
        console.error("❌ SSE error:", err.message);
      },
    });

    return () => subscription.unsubscribe();
  }, [url]);

  const statusMessages = {
    connecting: "🔌 Conectando...",
    listening: "🎧 Recibiendo datos...",
    completed: "✅ Conexión cerrada",
    error: "❌ Error en la conexión",
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="mb-2">
        <span className="font-semibold">Estado: </span>
        <span>{statusMessages[status]}</span>
      </div>
      <div>
        <span className="font-semibold">Valor: </span>
        <span>{count !== null ? count : "Cargando..."}</span>
      </div>
    </div>
  );
}

// Helper function to create SSE observable
function createSSEObservableWithFetch(url: string) {
  return new Observable<MessageEvent>((subscriber) => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.message === "closing") {
        subscriber.complete(); // 🔹 ahora tratamos como fin normal
        eventSource.close();
      } else {
        subscriber.next(event);
      }
    };

    eventSource.onerror = () => {
      subscriber.error(new Error("SSE error"));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  });
}

// Simple Observable implementation if not already defined
type Observer<T> = {
  next: (value: T) => void;
  error: (err: Error) => void;
  complete: () => void;
};

type Subscription = {
  unsubscribe: () => void;
};

class Observable<T> {
  private _subscribe: (observer: Observer<T>) => () => void;

  constructor(subscribe: (observer: Observer<T>) => () => void) {
    this._subscribe = subscribe;
  }

  subscribe(observer: Partial<Observer<T>>): Subscription {
    const subscription = {
      unsubscribe: () => {},
    };

    const safeObserver: Observer<T> = {
      next: (value: T) => observer.next?.(value),
      error: (err: Error) => {
        observer.error?.(err);
        subscription.unsubscribe();
      },
      complete: () => {
        observer.complete?.();
        subscription.unsubscribe();
      },
    };

    subscription.unsubscribe = this._subscribe(safeObserver) || (() => {});

    return subscription;
  }
}

import { Observable } from "rxjs";

type SSEMessage = {
  type: string;
  data?: unknown;
  id?: string;
  event?: string;
  // Add other specific fields you expect in your SSE messages
  [key: string]: unknown;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type Tool = {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
};

type Context = Record<string, unknown>;

type ChatInput = {
  messages: Message[];
  tools: Tool[];
  context: Context[];
  threadId: string;
  runId: string;
};

interface CreateChatStreamInput extends Omit<ChatInput, 'messages'> {
  messages: Array<Omit<Message, 'id'>>;
}

export const createChatStream = (input: CreateChatStreamInput): Observable<SSEMessage> => {
  return new Observable((subscriber) => {
    const controller = new AbortController();

    // Notificar que el chat está iniciando
    subscriber.next({ type: 'RUN_STARTED' });

    // Ensure required fields are present
    const requestData: ChatInput = {
      threadId: input.threadId,
      runId: input.runId,
      messages: input.messages.map(msg => ({
        ...msg,
        id: crypto.randomUUID(),
      })),
      tools: input.tools || [],
      context: input.context || [],
    };

    fetch("http://localhost:8000/awp", {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    })
      .then(async (res) => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) {
          subscriber.error("No se pudo leer el stream de respuesta");
          return;
        }

        let buffer = "";
        let isFirstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n").filter(Boolean);
          for (const raw of events) {
            try {
              const event = JSON.parse(raw.split("data: ")[1]);
              
              // Notificar el evento actual
              subscriber.next(event);
              
              // Manejar eventos especiales
              if (event.type === "RUN_FINISHED") {
                subscriber.complete();
                return;
              } else if (event.type === "RUN_ERROR") {
                subscriber.error(event.error || "Error desconocido");
                return;
              }
              
              // Notificar el primer chunk de contenido
              if (isFirstChunk && (event.type === "TEXT_MESSAGE_CONTENT" || event.type === "CONTENT_CHUNK")) {
                isFirstChunk = false;
              }
              
            } catch (err) {
              console.error("Error al analizar el evento SSE:", err, raw);
            }
          }
          
          // Limpiar el buffer
          buffer = "";
        }
        
        // Si llegamos aquí sin un evento de finalización, completamos el stream
        subscriber.complete();
      })
      .catch((err) => {
        console.error("Error en la solicitud de chat:", err);
        subscriber.error(err.message || "Error en la comunicación con el servidor");
      });

    return () => {
      controller.abort();
    };
  });
};

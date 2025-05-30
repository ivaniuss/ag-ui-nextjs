import { Observable } from 'rxjs';

// export function createSSEObservable(url: string) {
//   return new Observable<MessageEvent>((subscriber) => {
//     const source = new EventSource(url);
    
//     source.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       if (data.message === 'closing') {
//         subscriber.complete(); // 🔹 ahora tratamos como fin normal
//         source.close();
//       } else {
//         subscriber.next(event);
//       }
//     };

//     source.onerror = () => {
//       subscriber.error(new Error('SSE connection error'));
//       source.close();
//     };

//     return () => {
//       source.close(); // limpieza cuando se destruye el observable
//     };
//   });
// }

export function createSSEObservableWithFetch(url: string, options?: RequestInit) {
  return new Observable<MessageEvent>((subscriber) => {
    let cancelled = false;

    fetch(url, {
      method: 'GET',
      ...options,
    })
      .then((response) => {
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        const read = () => {
          reader.read().then(({ done, value }) => {
            if (cancelled || done) {
              subscriber.complete();
              return;
            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // keep the last partial chunk

            for (const line of lines) {
              const match = line.match(/^data:\s?(.*)$/m);
              if (match) {
                try {
                  const data = JSON.parse(match[1]);
                  if (data.message === 'closing') {
                    subscriber.complete();
                    return;
                  }
                  subscriber.next(new MessageEvent('message', { data: match[1] }));
                } catch (err) {
                  subscriber.error(err);
                }
              }
            }

            read(); // keep reading
          });
        };

        read();
      })
      .catch((err) => {
        subscriber.error(err);
      });

    return () => {
      cancelled = true;
    };
  });
}

// export function createSSEObservableWithFetch(url: string, options?: RequestInit) {
//   return new Observable<MessageEvent>((subscriber) => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const response = await fetch(url, {
//           method: 'GET',
//           ...options,
//         });

//         if (!response.body) {
//           throw new Error('No response body found');
//         }

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';

//         while (!cancelled) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           buffer += decoder.decode(value, { stream: true });
//           const parts = buffer.split('\n\n');
//           buffer = parts.pop() || ''; // keep the last partial message

//           for (const part of parts) {
//             const match = part.match(/^data:\s?(.*)$/m);
//             if (match) {
//               try {
//                 const data = JSON.parse(match[1]);
//                 if (data.message === 'closing') {
//                   subscriber.complete();
//                   return;
//                 }
//                 subscriber.next(new MessageEvent('message', { data: match[1] }));
//               } catch (err) {
//                 subscriber.error(err);
//               }
//             }
//           }
//         }

//         subscriber.complete();
//       } catch (error) {
//         subscriber.error(error);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   });
// }


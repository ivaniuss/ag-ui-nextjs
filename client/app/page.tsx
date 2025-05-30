'use client';

// import { SSECounter } from '@/components/SSECounter';
import { ChatGPTSimulator } from '@/components/ChatGPTSimulator';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Demo de Componentes</h1>
          <p className="text-gray-600">Interfaz de ejemplo con componentes interactivos</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Contador en Tiempo Real</h2>
            <SSECounter 
              url="http://localhost:8000/sse" 
              title="Contador Básico"
            />
          </div> */}
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Simulador de ChatGPT</h2>
            <ChatGPTSimulator />
          </div>
        </div>
      </div>
    </main>
  );
}

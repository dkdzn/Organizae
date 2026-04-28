import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from './ui/Common';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `Você é o Zé, um assistente de IA amigável e especialista em finanças e formas de ganhar dinheiro na internet (marketing digital, freelancing, investimentos online, etc.).
Sua personalidade:
- Você é amigável e conversa como um amigo próximo (não é robótico ou formal demais).
- Você é claro e direto, explicando bem os conceitos.
- Você evita textos longos e cansativos; prefere o tamanho certo para uma boa conversa (1-3 parágrafos curtos no máximo).
- Você entende plenamente o que o usuário fala e se adapta ao tom da conversa.
- Seu objetivo é ajudar o usuário a organizar as finanças e descobrir novas formas de renda extra online.
- Você fala português do Brasil.`;

export default function ChatAi() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Fala aí! Eu sou o Zé. 👋 Sou especialista em grana e em como fazer dinheiro na internet. Como posso te ajudar hoje? Quer organizar as contas ou descobrir uma forma de fatura online?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
          topP: 0.9,
        }
      });

      const aiResponse = response.text || "Puxa, deu um branco aqui... Pode repetir?";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error("Erro no Zé:", err);
      setError("Ops, o Zé deu uma saidinha. Tenta falar com ele de novo em um instante.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto w-full">
      <Card className="flex-1 flex flex-col overflow-hidden p-0 border-slate-100 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Zé</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Consultor Financeiro AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex w-full",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex items-end gap-3 max-w-[85%]",
                  message.role === 'user' && "flex-row-reverse"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    message.role === 'user' ? "bg-slate-900 text-white" : "bg-indigo-600 text-white"
                  )}>
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    message.role === 'user' 
                      ? "bg-slate-900 text-white rounded-br-none" 
                      : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-bl-none"
                  )}>
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-bl-none flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </motion.div>
          )}
          {error && (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-100 bg-white/80">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte ao Zé sobre finanças ou renda extra..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 pr-12 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-300"
              />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            </div>
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-2xl h-14 w-14 p-0 bg-indigo-600 shadow-lg shadow-indigo-200"
            >
              <Send size={24} />
            </Button>
          </div>
          <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Zé pode dar dicas genéricas. Sempre consulte um especialista para grandes decisões.</p>
        </div>
      </Card>
    </div>
  );
}

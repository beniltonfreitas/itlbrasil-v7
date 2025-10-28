import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2, Sparkles } from 'lucide-react';
import { useJornalistaPro } from '@/hooks/useJornalistaPro';

interface JornalistaProProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JornalistaPro: React.FC<JornalistaProProps> = ({ open, onOpenChange }) => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearMessages } = useJornalistaPro();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Analise esta notícia para possíveis vieses',
    'Sugira manchetes para um artigo sobre economia',
    'Como verificar a veracidade de uma informação?',
    'Roteiro de entrevista sobre direitos humanos',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Jornalista Pró
          </DialogTitle>
          <DialogDescription>
            Assistente de IA especializado em jornalismo profissional
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Sparkles className="h-16 w-16 text-primary mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Bem-vindo ao Jornalista Pró</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Seu assistente especializado em análise jornalística, produção de conteúdo,
                  pesquisa e boas práticas éticas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                  {suggestedPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="text-left h-auto py-3 px-4 whitespace-normal"
                      onClick={() => {
                        setInput(prompt);
                      }}
                    >
                      <span className="text-sm">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="flex flex-col gap-2">
            {messages.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar conversa
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta ou solicite análise jornalística..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Powered by Lovable AI • Modelo Gemini 2.5 Flash (gratuito até 06/10/2025)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

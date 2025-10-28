import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useCreateRSSFeed, useUpdateRSSFeed } from "@/hooks/useRSSFeeds";
import { useToast } from "@/hooks/use-toast";
import { Info, Settings, CheckCircle2, Globe } from "lucide-react";

const rssSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  url: z.string().url("URL deve ser válida"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  import_mode: z.enum(["manual", "automatic"]).default("manual"),
  import_interval: z.number().min(15, "Intervalo mínimo é 15 minutos").default(60),
  max_articles_per_import: z.number().min(1).max(5).default(1),
  active: z.boolean().default(true),
  auto_publish: z.boolean().default(false),
});

type RSSFormData = z.infer<typeof rssSchema>;

interface RSSFeedFormWithSidebarProps {
  feed?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RSSFeedFormWithSidebar = ({ feed, onSuccess, onCancel }: RSSFeedFormWithSidebarProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: categories } = useCategories();
  const createMutation = useCreateRSSFeed();
  const updateMutation = useUpdateRSSFeed();
  const { toast } = useToast();
  
  const isEditing = !!feed;

  const steps = [
    {
      id: 0,
      title: "Informações Básicas",
      icon: Info,
      description: "Nome, URL e descrição do feed"
    },
    {
      id: 1,
      title: "Configurações",
      icon: Settings,
      description: "Modo de importação e categoria"
    },
    {
      id: 2,
      title: "Status",
      icon: CheckCircle2,
      description: "Ativação e publicação automática"
    }
  ];

  const form = useForm<RSSFormData>({
    resolver: zodResolver(rssSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      category_id: "",
      import_mode: "manual",
      import_interval: 60,
      max_articles_per_import: 1,
      active: true,
      auto_publish: false,
    },
  });

useEffect(() => {
  if (feed) {
    form.reset({
      name: feed.name,
      url: feed.url,
      description: feed.description || "",
      category_id: feed.category_id || "",
      import_mode: feed.import_mode,
      import_interval: feed.import_interval,
      max_articles_per_import: feed.max_articles_per_import || 1,
      active: feed.active,
      auto_publish: feed.auto_publish,
    });
  }
}, [feed, form]);

// Auto-select categoria "Geral" ao criar
useEffect(() => {
  if (!feed && categories && !form.getValues('category_id')) {
    const geral = categories.find(c => c.slug === 'geral' || c.name.toLowerCase() === 'geral');
    if (geral) form.setValue('category_id', geral.id);
  }
}, [categories, feed, form]);

  const onSubmit = async (data: RSSFormData) => {
    try {
      const feedData = {
        name: data.name,
        url: data.url,
        description: data.description || null,
        category_id: data.category_id || null,
        import_mode: data.import_mode,
        import_interval: data.import_interval,
        max_articles_per_import: data.max_articles_per_import,
        active: data.active,
        auto_publish: data.auto_publish,
        is_native: false,
        review_queue: !data.auto_publish,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: feed.id,
          ...feedData,
        });
        toast({
          title: "Feed atualizado",
          description: "As configurações do feed foram atualizadas com sucesso.",
        });
      } else {
        await createMutation.mutateAsync(feedData);
        toast({
          title: "Feed criado",
          description: "O novo feed RSS foi criado com sucesso.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o feed.",
        variant: "destructive",
      });
    }
  };

  const isAutomatic = form.watch("import_mode") === "automatic";

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Feed *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Portal de Notícias" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Feed RSS *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://exemplo.com/rss" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descrição opcional do feed..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Padrão</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categoria aplicada aos artigos importados
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="import_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modo de Importação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Manual: sob demanda | Automático: intervalos regulares
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAutomatic && (
              <FormField
                control={form.control}
                name="import_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="15"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                      />
                    </FormControl>
                    <FormDescription>
                      Frequência de verificação (mínimo: 15 minutos)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="max_articles_per_import"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade a importar</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="1 notícia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 notícia</SelectItem>
                      <SelectItem value="2">2 notícias</SelectItem>
                      <SelectItem value="3">3 notícias</SelectItem>
                      <SelectItem value="4">4 notícias</SelectItem>
                      <SelectItem value="5">5 notícias</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Número de notícias mais recentes por execução
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Feed Ativo</FormLabel>
                    <FormDescription>
                      Feed será processado conforme configurações
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_publish"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto-publicar</FormLabel>
                    <FormDescription>
                      Artigos importados serão publicados automaticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-[600px]">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-border p-4 bg-muted/20">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${isCompleted ? 'text-green-500' : ''}`} />
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs opacity-80">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>

            <div className="flex-1">
              {renderStepContent()}
            </div>

            {/* Navigation Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {isEditing ? "Atualizar" : "Criar"} Feed
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RSSFeedFormWithSidebar;
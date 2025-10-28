import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface RSSFeedFormProps {
  feed?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RSSFeedForm = ({ feed, onSuccess, onCancel }: RSSFeedFormProps) => {
  const { data: categories } = useCategories();
  const createMutation = useCreateRSSFeed();
  const updateMutation = useUpdateRSSFeed();
  const { toast } = useToast();
  
  const isEditing = !!feed;

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

// Load feed data when editing
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
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
                  Categoria que será aplicada aos artigos importados (se não especificado no feed)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Import Settings */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium">Configurações de Importação</h3>
          
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
                  Manual: importação sob demanda | Automático: importação em intervalos regulares
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
                  <FormLabel>Intervalo de Importação (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="15"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                    />
                  </FormControl>
                  <FormDescription>
                    Frequência de verificação de novos conteúdos (mínimo: 15 minutos)
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
                  Número de notícias mais recentes que serão importadas por execução
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status Settings */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium">Status e Configurações</h3>
          
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Feed Ativo</FormLabel>
                  <FormDescription>
                    Quando ativo, o feed será processado conforme as configurações
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
                  <FormLabel className="text-base">Auto-publicar Artigos</FormLabel>
                  <FormDescription>
                    Os artigos importados serão automaticamente publicados no site
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

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? "Atualizar" : "Criar"} Feed
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RSSFeedForm;
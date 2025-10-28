import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategoryCRUD";
import { Category } from "@/hooks/useCategories";
import { useEffect } from "react";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").trim(),
  slug: z.string().min(1, "Slug é obrigatório").trim().regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória").regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato hexadecimal (#RRGGBB)"),
  icon: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const predefinedColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

export const CategoryForm = ({ category, onSuccess, onCancel }: CategoryFormProps) => {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      color: "#3B82F6",
      icon: "",
    },
  });

  const isEditing = !!category;

  // Populate form with existing data when editing
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        color: category.color || "#3B82F6",
        icon: category.icon || "",
      });
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          name: data.name,
          slug: data.slug,
          color: data.color,
          description: data.description || null,
          icon: data.icon || null,
        });
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          slug: data.slug,
          color: data.color,
          description: data.description || null,
          icon: data.icon || null,
        });
      }
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
    
    form.setValue("slug", slug);
  };

  const selectedColor = form.watch("color");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Categoria" : "Nova Categoria"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome*</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          if (!isEditing) {
                            handleNameChange(e.target.value);
                          }
                        }}
                        placeholder="Nome da categoria"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="slug-da-categoria" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descrição da categoria..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor*</FormLabel>
                  <FormDescription>
                    Escolha uma cor para identificar a categoria
                  </FormDescription>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="#3B82F6"
                          className="font-mono"
                        />
                      </FormControl>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            selectedColor === color 
                              ? "border-foreground scale-110" 
                              : "border-gray-300 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => form.setValue("color", color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormDescription>
                    Nome do ícone Lucide (ex: "tag", "folder", "star")
                  </FormDescription>
                  <FormControl>
                    <Input {...field} placeholder="tag" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {isEditing ? "Atualizar" : "Criar"} Categoria
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateAuthor, useUpdateAuthor, Author } from "@/hooks/useAuthors";
import { useEffect } from "react";

const authorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").trim(),
  slug: z.string().min(1, "Slug é obrigatório").trim().regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  bio: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type AuthorFormData = z.infer<typeof authorSchema>;

interface AuthorFormProps {
  author?: Author;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AuthorForm = ({ author, onSuccess, onCancel }: AuthorFormProps) => {
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  
  const form = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: "",
      slug: "",
      bio: "",
      email: "",
      avatar_url: "",
    },
  });

  const isEditing = !!author;

  // Populate form with existing data when editing
  useEffect(() => {
    if (author) {
      form.reset({
        name: author.name,
        slug: author.slug,
        bio: author.bio || "",
        email: author.email || "",
        avatar_url: author.avatar_url || "",
      });
    }
  }, [author, form]);

  const onSubmit = async (data: AuthorFormData) => {
    try {
      if (isEditing && author) {
        await updateAuthor.mutateAsync({
          id: author.id,
          name: data.name,
          slug: data.slug,
          bio: data.bio || null,
          email: data.email || null,
          avatar_url: data.avatar_url || null,
        });
      } else {
        await createAuthor.mutateAsync({
          name: data.name,
          slug: data.slug,
          bio: data.bio || null,
          email: data.email || null,
          avatar_url: data.avatar_url || null,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Autor" : "Novo Autor"}
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
                        placeholder="Nome do autor"
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
                      <Input {...field} placeholder="slug-do-autor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="email@exemplo.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="Avatar do Autor"
                      placeholder="URL do avatar ou faça upload"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Biografia do autor..."
                      rows={4}
                    />
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
                disabled={createAuthor.isPending || updateAuthor.isPending}
              >
                {isEditing ? "Atualizar" : "Criar"} Autor
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
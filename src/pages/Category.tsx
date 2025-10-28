import { useParams } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import NewsCard from "@/components/NewsCard";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: articles, isLoading: articlesLoading } = useArticles({
    category: slug,
  });
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const currentCategory = categories?.find(cat => cat.slug === slug);
  
  if (categoriesLoading) {
    return <div>Carregando...</div>;
  }
  
  if (!currentCategory) {
    return <div>Categoria não encontrada</div>;
  }

  return (
    <>
      <SEO 
        title={`${currentCategory.name} - ITL BRASIL`}
        description={currentCategory.description || `Últimas notícias sobre ${currentCategory.name.toLowerCase()}`}
      />
      <main>
        {/* Category Header */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {currentCategory.name}
              </h1>
              {currentCategory.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {currentCategory.description}
                </p>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{articles?.length || 0} artigos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {articlesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles
                  .filter(article => article && article.slug) // Filter out null/undefined articles and articles without slug
                  .map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-muted-foreground">
                  Ainda não há artigos publicados nesta categoria.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Category;
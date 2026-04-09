import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft: 'bg-warning/20 text-warning',
  scheduled: 'bg-linkedin/20 text-linkedin',
  published: 'bg-success/20 text-success',
};

const MyPosts = () => {
  const drafts = useAppStore((s) => s.drafts);

  const renderPosts = (filter?: string) => {
    const filtered = filter ? drafts.filter((d) => d.status === filter) : drafts;
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No posts yet. Start drafting!</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {filtered.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">{post.content.slice(0, 100)}…</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge className={cn('text-xs shrink-0', statusColors[post.status])}>{post.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">My Posts</h1>
      <p className="text-muted-foreground text-sm mb-6">All your drafted and published content.</p>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{renderPosts()}</TabsContent>
        <TabsContent value="draft" className="mt-4">{renderPosts('draft')}</TabsContent>
        <TabsContent value="published" className="mt-4">{renderPosts('published')}</TabsContent>
      </Tabs>
    </div>
  );
};

export default MyPosts;

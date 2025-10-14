'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Resource {
  id: number;
  name: string;
  isFree: boolean;
  createdAt: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/resources');
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        }
      } catch (error) {
        console.error('Failed to fetch resources', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Resources</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle>{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Badge variant={resource.isFree ? 'default' : 'secondary'}>
                  {resource.isFree ? 'Free' : 'Paid'}
                </Badge>
                <a href={`/api/resources/${resource.id}/download`} download>
                  <Button>Download</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

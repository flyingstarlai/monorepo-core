import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Skeleton } from '../../../components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import type { MobileAppDefinition } from '../types';
import { useDefinitions, useDeleteDefinition } from '../hooks/use-app-builder';
import { DeleteDefinitionDialog } from './delete-definition-dialog';

import { formatDistanceToNow } from 'date-fns';

export function DefinitionsList() {
  const { data: definitions, isLoading, error } = useDefinitions();
  const deleteDefinition = useDeleteDefinition();

  const [deletingDefinition, setDeletingDefinition] =
    useState<MobileAppDefinition | null>(null);

  const handleDelete = (def: MobileAppDefinition) => {
    // Open confirmation dialog; actual delete runs on dialog confirm
    setDeletingDefinition(def);
  };

  const getStatusBadge = () => <Badge variant="default">Configured</Badge>;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mobile App Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mobile App Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            Error loading definitions: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mobile App Definitions</CardTitle>
        <Link to="/app-builder/create">
          <Button>Create Definition</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {definitions?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No mobile app definitions found
            </p>
            <Link to="/app-builder/create">
              <Button>Create First Definition</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App Name</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Server IP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {definitions?.map((definition) => (
                <TableRow key={definition.id}>
                  <TableCell className="font-medium">
                    {definition.appName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {definition.appId}
                  </TableCell>
                  <TableCell>{definition.appModule}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {definition.serverIp}
                  </TableCell>
                  <TableCell>{getStatusBadge()}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(definition.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link
                        to="/app-builder/$id/build"
                        params={{ id: definition.id }}
                      >
                        <Button variant="outline" size="sm">
                          Build
                        </Button>
                      </Link>
                      <Link
                        to="/app-builder/$id/history"
                        params={{ id: definition.id }}
                      >
                        <Button variant="outline" size="sm">
                          History
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(definition)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      {deletingDefinition && (
        <DeleteDefinitionDialog
          definition={deletingDefinition}
          open={!!deletingDefinition}
          onOpenChange={(open) => !open && setDeletingDefinition(null)}
          onConfirm={async () => {
            try {
              await deleteDefinition.mutateAsync(deletingDefinition.id);
            } finally {
              setDeletingDefinition(null);
            }
          }}
          isDeleting={deleteDefinition.isPending}
        />
      )}
    </Card>
  );
}

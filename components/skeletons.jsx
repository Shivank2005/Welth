"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className="h-[200px] w-[200px] rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </CardContent>
        </Card>
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center p-2 border-b">
                <div className="flex gap-4 w-1/2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BudgetsSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecurringSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div className="space-y-2 w-full">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse shrink-0" />
              </CardHeader>
              <CardContent className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AssistantSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <Card className="flex h-[calc(100vh-12rem)] flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-16 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
          <div className="flex gap-3 flex-row-reverse">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-10 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-24 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        </CardContent>
        <div className="border-t p-4 flex gap-2">
          <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse shrink-0" />
        </div>
      </Card>
    </div>
  );
}


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface NotificationFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  unreadCount,
  onMarkAllAsRead
}) => {
  const filterOptions = ['all', 'unread', 'read', 'project', 'deadline', 'team', 'system'];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {filterOptions.map(filterType => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange(filterType)}
                  className="capitalize"
                >
                  {filterType}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={onMarkAllAsRead}
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

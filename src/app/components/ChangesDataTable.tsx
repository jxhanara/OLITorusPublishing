import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";
import { Eye, LayoutGrid, LayoutList } from "lucide-react";
import { format } from "date-fns";

interface Change {
  id: string;
  page: string;
  type: "text" | "image" | "layout" | "delete";
  description: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  timestamp: Date;
  status: "pending" | "published" | "draft";
}

interface ChangesDataTableProps {
  changes: Change[];
  onViewDiff?: (changeId: string) => void;
}

export function ChangesDataTable({ changes, onViewDiff }: ChangesDataTableProps) {
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  const getTypeColor = (type: Change["type"]) => {
    switch (type) {
      case "text":
        return "bg-primary/10 text-primary";
      case "image":
        return "bg-chart-4/10 text-chart-4";
      case "layout":
        return "bg-chart-2/10 text-chart-2";
      case "delete":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: Change["status"]) => {
    switch (status) {
      case "pending":
        return "bg-chart-3/10 text-chart-3";
      case "published":
        return "bg-chart-2/10 text-chart-2";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recent Changes</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Display density:</span>
          <Toggle
            pressed={density === "compact"}
            onPressedChange={(pressed) =>
              setDensity(pressed ? "compact" : "comfortable")
            }
            size="sm"
          >
            {density === "compact" ? (
              <LayoutList className="w-4 h-4" />
            ) : (
              <LayoutGrid className="w-4 h-4" />
            )}
          </Toggle>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => (
              <TableRow
                key={change.id}
                className={density === "compact" ? "h-10" : "h-16"}
              >
                <TableCell className="font-medium">{change.page}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getTypeColor(change.type)} capitalize`}
                  >
                    {change.type}
                  </Badge>
                </TableCell>
                <TableCell className={density === "compact" ? "text-sm" : ""}>
                  {change.description}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className={density === "compact" ? "w-6 h-6" : "w-8 h-8"}>
                      <AvatarImage src={change.author.avatar} alt={change.author.name} />
                      <AvatarFallback className="text-xs">
                        {change.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={density === "compact" ? "text-sm" : ""}>
                      {change.author.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(change.timestamp, "MMM d, h:mm a")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(change.status)} capitalize`}
                  >
                    {change.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDiff?.(change.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Diff
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

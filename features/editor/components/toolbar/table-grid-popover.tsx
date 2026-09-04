"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconTable,
  IconColumns3,
  IconLayoutRows,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TableContextMenu } from "./table-context-menu";

const MAX_ROWS = 8;
const MAX_COLS = 8;

interface TableGridPopoverProps {
  editor: Editor;
}

export function TableGridPopover({ editor }: TableGridPopoverProps) {
  const [hoveredRows, setHoveredRows] = React.useState(1);
  const [hoveredCols, setHoveredCols] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showMatrix, setShowMatrix] = React.useState(true);

  const isInTable = editor.isActive("table");

  const handleCellHover = (row: number, col: number) => {
    setHoveredRows(row);
    setHoveredCols(col);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium transition-colors shrink-0 ${
          isInTable
            ? "bg-muted text-primary"
            : "hover:bg-muted hover:text-foreground text-muted-foreground"
        }`}
        title="Insert or Manage Table"
      >
        <IconTable className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 shadow-xl rounded-xl border bg-popover text-popover-foreground space-y-3"
        align="start"
      >
        {isInTable && !showMatrix ? (
          /* Contextual Controls for Existing Table */
          <div className="w-56 space-y-1">
            <div className="flex items-center justify-between pb-1 border-b">
              <span className="text-xs font-semibold">Table Controls</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-1.5 gap-1 text-primary"
                onClick={() => setShowMatrix(true)}
              >
                <IconPlus className="h-3 w-3" />
                New Table
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <IconRowInsertBottom className="h-3.5 w-3.5" />
              Add Row Below
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <IconRowInsertTop className="h-3.5 w-3.5" />
              Add Row Above
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <IconColumnInsertRight className="h-3.5 w-3.5" />
              Add Column Right
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <IconColumnInsertLeft className="h-3.5 w-3.5" />
              Add Column Left
            </Button>
            <div className="h-px bg-border my-1" />
            <div className="pt-0.5">
              <TableContextMenu editor={editor}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-7 gap-2 font-semibold text-primary"
                >
                  <IconTable className="h-3.5 w-3.5" />
                  Cell Color & Alignment…
                </Button>
              </TableContextMenu>
            </div>
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().mergeOrSplit().run()}
            >
              Merge / Split Cells
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
              Toggle Header Row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            >
              Toggle Header Column
            </Button>
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <IconTrash className="h-3.5 w-3.5" />
              Delete Row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <IconTrash className="h-3.5 w-3.5" />
              Delete Column
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive font-semibold"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <IconTrash className="h-3.5 w-3.5" />
              Delete Table
            </Button>
          </div>
        ) : (
          /* Interactive Grid Matrix Selector matching user screenshot */
          <div className="space-y-3">
            {isInTable && (
              <div className="flex items-center justify-between pb-1 border-b">
                <span className="text-xs font-semibold">Insert New Table</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-1.5 text-muted-foreground"
                  onClick={() => setShowMatrix(false)}
                >
                  Edit Current
                </Button>
              </div>
            )}

            {/* 8x8 Grid of Rounded Squares */}
            <div
              className="grid grid-cols-8 gap-1 p-1 bg-muted/20 rounded-lg select-none"
              onMouseLeave={() => {
                // Keep the selection active
              }}
            >
              {Array.from({ length: MAX_ROWS }).map((_, rIdx) => {
                const row = rIdx + 1;
                return Array.from({ length: MAX_COLS }).map((_, cIdx) => {
                  const col = cIdx + 1;
                  const isHighlighted = row <= hoveredRows && col <= hoveredCols;
                  return (
                    <div
                      key={`${row}-${col}`}
                      onMouseEnter={() => handleCellHover(row, col)}
                      onClick={() => handleInsertTable(hoveredRows, hoveredCols)}
                      className={`h-5 w-5 rounded-[5px] border transition-all cursor-pointer ${
                        isHighlighted
                          ? "bg-primary/20 border-primary shadow-2xs scale-95"
                          : "border-muted-foreground/25 bg-card hover:border-muted-foreground/50"
                      }`}
                      title={`${col} × ${row}`}
                    />
                  );
                });
              })}
            </div>

            {/* Dimensions Badge Display: [Cols] X  x  [Rows] Y */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium font-mono text-foreground shadow-2xs">
                <IconColumns3 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{hoveredCols}</span>
              </div>

              <span className="text-xs font-mono text-muted-foreground">×</span>

              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium font-mono text-foreground shadow-2xs">
                <IconLayoutRows className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{hoveredRows}</span>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              className="w-full h-7 text-xs font-semibold shadow-2xs"
              onClick={() => handleInsertTable(hoveredRows, hoveredCols)}
            >
              Insert {hoveredCols} × {hoveredRows} Table
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
